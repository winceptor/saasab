var express = require('express');
var router = express.Router();

var request = require("request");
var async = require("async");

var HOST_URL = "";

// =====================================
// DIRECTIONS ==========================
// =====================================
router.get('/directions', function(req, res) {

    HOST_URL = res.locals.hosturl;
    var origin = req.query.origin || 'Lappeenranta';
    var destination = req.query.destination || 'Helsinki';
    var travelmode = req.query.travelmode || 'DRIVING';
    var vehicleId = '';
    var userId = '';
    if (req.user) {
        vehicleId = req.user.vehicleIdentificationNumber || '';
        userId = req.user.id || '';
    }

    async.waterfall([
        async.apply(getDirections, origin, destination, vehicleId),
        getEmissions,
        async.apply(getCarpools, Date.now(), userId)
    ], function(error, body) {

        var origin = '';
        var destination = '';

        if (error) {
            //TODO: mitä näytetään UI:ssa kun ei saada vastausta?
        }
        else {
            origin = body.result.routes[0].legs[0].start_address;
            destination = body.result.routes[0].legs[0].end_address;
        }

        res.render('atob.ejs', {
            errors: req.flash('error'),
            message: req.flash('message'),
            origin: origin,
            destination: destination,
            travelmode: travelmode,
            apiresponse: body
        }); // load the ejs file
    });

});

var getDirections = function(origin, destination, vehicleId, callback) {

    request({
        url: HOST_URL + "/googlemaps_api?origin=" + origin + "&destination=" + destination,
        json: true
    }, function(error, response, body) {
        if (error) {
            callback(error);
        }
        else {
            callback(null, vehicleId, body);
        }
    });

};

var getEmissions = function(vehicleId, directionsBody, callback) {

    if (directionsBody.result.status != 'OK') {
        callback('Error');
    }
    else {
        request({
            url: HOST_URL + '/ajoneuvodata_api?distance=' + (directionsBody.result.routes[0].legs[0].distance.value / 1000) + '&vehicleId=' + vehicleId,
            json: true
        }, function(error, response, body) {
            if (error) {
                callback(error);
            }
            else {
                directionsBody.result.emissions = body.result.Co2;

                var originlat = directionsBody.result.routes[0].legs[0].start_location.lat;
                var originlong = directionsBody.result.routes[0].legs[0].start_location.lng;
                var destinationlat = directionsBody.result.routes[0].legs[0].end_location.lat;
                var destinationlong = directionsBody.result.routes[0].legs[0].end_location.lng;
                callback(null, originlat, originlong, destinationlat, destinationlong, directionsBody);
            }
        });
    }
};

var getCarpools = function(timevar, userId, originlat, originlong, destinationlat, destinationlong, directionsBody, callback) {

    // var timevar = Date.now();
    // if (req.query.time && req.query.time != "") {
    //     timevar = new Date(+req.query.time);
    // }

    request({
        url: HOST_URL + '/carpool_api?originlat=' + originlat + '&originlong=' + originlong + '&destinationlat=' + destinationlat + '&destinationlong=' + destinationlong + '&time=' + timevar + '&userid=' + userId,
        json: true
    }, function(error, response, body) {
        if (error) {
            callback(error);
        }
        else {
            directionsBody.result.trips = body.result;
            callback(null, directionsBody);
        }
    });
};

module.exports = router;
