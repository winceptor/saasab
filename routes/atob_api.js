var express = require('express');
var router = express.Router();

var request = require("request");
var async = require("async");

var HOST_URL = "";


// =====================================
// DIRECTIONS ==========================
// =====================================
router.get('/atob_api', function(req, res) {

    //HOST_URL = res.locals.hosturl;
    // var origininput = req.query.origin;

    var destination = req.query.destination || 'Helsinki';
    var travelmode = req.query.travelmode || 'DRIVING';
    var vehicleId = req.query.vehicleid || '';
    var userId = req.query.userid || '';

    /*if (req.user) {
        vehicleId = req.user.vehicleIdentificationNumber || '';
        userId = req.user.id || '';
    }*/

    var timevar = res.locals.Today;
    if (req.query.time && req.query.time != "") {
        //timevar = new Date(+req.query.time);
        timevar = res.locals.InputToDate(req.query.time, res.locals.gmtoffset);
    }

    var origin = 'Kouvola';


    var time = res.locals.DateToInput(timevar, res.locals.gmtoffset);

    var apiresponse = {};
    apiresponse.status = "OK";
    apiresponse.route = {};
    apiresponse.emissions = {};
    apiresponse.trips = {};

    //ip api
    request({
        url: res.locals.hosturl + encodeURI('/iplocation_api/locate?ip=' + res.locals.clientip),
        json: true
    }, function(error, response, body) {

        if (error || response.statusMessage != "OK") {
            apiresponse.status = "problem";

            apiresponse.iplocation.status = response.statusMessage;
            apiresponse.iplocation.result = body;
        }
        else {
            apiresponse.iplocation = body;

            var iplocation = apiresponse.iplocation.result;

            origin = iplocation.city + ", " + iplocation.country;
        }


        if (req.query.autolocation && req.query.autolocation != "") {
            origin = req.query.autolocation;
        }

        if (req.query.origin && req.query.origin != "") {
            origin = req.query.origin;
        }

        //route api
        request({
            url: res.locals.hosturl + encodeURI("/googlemaps_api/route?origin=" + origin + "&destination=" + destination),
            json: true
        }, function(error, response, body) {

            if (error || response.statusMessage != "OK") {
                apiresponse.status = "problem";

                apiresponse.route.status = response.statusMessage;
                apiresponse.route.result = body;
            }
            else {
                apiresponse.route = body;

                if (apiresponse.route.status == "OK") {

                    //console.log(response.statusText);
                    //console.log("body:");
                    //console.log(response);
                    var route = apiresponse.route.result;

                    //origin = route.start_address;
                    //destination = route.end_address;


                    //emissions api
                    request({
                        url: res.locals.hosturl + encodeURI('/ajoneuvodata_api/data?distance=' + (route.distance.value / 1000) + '&vehicleId=' + vehicleId),
                        json: true
                    }, function(error, response, body) {

                        if (error || response.statusMessage != "OK") {
                            apiresponse.status = "problem";

                            apiresponse.emissions.status = response.statusMessage;
                            apiresponse.emissions.result = body;
                        }
                        else {
                            apiresponse.emissions = body;
                            //console.log(body);
                        }


                        //carpool api
                        var originlat = route.start_location.lat;
                        var originlong = route.start_location.lng;
                        var destinationlat = route.end_location.lat;
                        var destinationlong = route.end_location.lng;
                        request({
                            url: res.locals.hosturl + encodeURI('/carpool_api/trips?originlat=' + originlat + '&originlong=' + originlong + '&destinationlat=' + destinationlat + '&destinationlong=' + destinationlong + '&time=' + time + '&userid=' + userId),
                            json: true
                        }, function(error, response, body) {

                            if (error || response.statusMessage != "OK") {
                                apiresponse.status = "problem";

                                apiresponse.trips.status = response.statusMessage;
                                apiresponse.trips.result = body;
                            }
                            else {
                                //console.log(body);
                                apiresponse.trips = body;
                            }

                            /*
                            return res.render('atob.ejs', {
                                errors: req.flash('error'),
                                message: req.flash('message'),
                                origin: req.query.origin,
                                destination: req.query.destination,
                                travelmode: travelmode,
                                timevar: req.query.time,
                                apiresponse: apiresponse
                            }); // load the ejs file*/

                            return res.send(JSON.stringify(apiresponse));
                        });
                        //carpool api end
                    });
                    //emissions api end
                }
                else {
                    return res.send(JSON.stringify(apiresponse));
                }
            }
        });
        //route api end
    });
    //iplocator api end
});



// =====================================
// DIRECTIONS ==========================
// =====================================
router.get('/atob', function(req, res) {

    //HOST_URL = res.locals.hosturl;
    // var origininput = req.query.origin;

    var destination = req.query.destination || 'Helsinki';
    var travelmode = req.query.travelmode || 'DRIVING';
    var vehicleId = '';
    var userId = '';
    if (req.user) {
        vehicleId = req.user.vehicleIdentificationNumber || '';
        userId = req.user.id || '';
    }


    var gmtoffset = res.locals.gmtoffset || 0;
    if (req.query.gmtoffset) {
        var gmtoffsetminutes = parseInt(req.query.gmtoffset);
        gmtoffset = -gmtoffsetminutes / 60;
        res.locals.gmtoffset = gmtoffset;
    }


    res.cookie('gmtoffset', res.locals.gmtoffset, {
        maxAge: 365 * 24 * 60 * 60 * 1000
    });

    var timevar = res.locals.Today;
    if (req.query.time && req.query.time != "") {
        //timevar = new Date(+req.query.time);
        timevar = res.locals.InputToDate(req.query.time, gmtoffset);
    }

    var origin = 'Kouvola';


    var time = res.locals.DateToInput(timevar, gmtoffset);


    var apiresponse = {};
    apiresponse.status = "OK";
    apiresponse.route = {};
    apiresponse.emissions = {};
    apiresponse.trips = {};

    //ip api
    request({
        url: res.locals.hosturl + encodeURI('/iplocation_api/locate?ip=' + res.locals.clientip),
        json: true
    }, function(error, response, body) {

        if (error || response.statusMessage != "OK") {
            apiresponse.status = "problem";

            apiresponse.iplocation.status = response.statusMessage;
            apiresponse.iplocation.result = body;
        }
        else {
            apiresponse.iplocation = body;

            var iplocation = apiresponse.iplocation.result;

            origin = iplocation.city + ", " + iplocation.country;
        }


        if (req.query.autolocation && req.query.autolocation != "") {
            origin = req.query.autolocation;
        }

        if (req.query.origin && req.query.origin != "") {
            origin = req.query.origin;
        }

        //route api
        request({
            url: res.locals.hosturl + encodeURI("/googlemaps_api/route?origin=" + origin + "&destination=" + destination),
            json: true
        }, function(error, response, body) {

            if (error || response.statusMessage != "OK") {
                apiresponse.status = "problem";

                apiresponse.route.status = response.statusMessage;
                apiresponse.route.result = body;
            }
            else {
                apiresponse.route = body;

                if (apiresponse.route.status == "OK") {

                    //console.log(response.statusText);
                    //console.log("body:");
                    //console.log(response);
                    var route = apiresponse.route.result;

                    //origin = route.start_address;
                    //destination = route.end_address;


                    //emissions api
                    request({
                        url: res.locals.hosturl + encodeURI('/ajoneuvodata_api/data?distance=' + (route.distance.value / 1000) + '&vehicleId=' + vehicleId),
                        json: true
                    }, function(error, response, body) {

                        if (error || response.statusMessage != "OK") {
                            apiresponse.status = "problem";

                            apiresponse.emissions.status = response.statusMessage;
                            apiresponse.emissions.result = body;
                        }
                        else {
                            apiresponse.emissions = body;
                            //console.log(body);
                        }


                        //carpool api
                        var originlat = route.start_location.lat;
                        var originlong = route.start_location.lng;
                        var destinationlat = route.end_location.lat;
                        var destinationlong = route.end_location.lng;
                        request({
                            url: res.locals.hosturl + encodeURI('/carpool_api/trips?originlat=' + originlat + '&originlong=' + originlong + '&destinationlat=' + destinationlat + '&destinationlong=' + destinationlong + '&time=' + time + '&userid=' + userId),
                            json: true
                        }, function(error, response, body) {

                            if (error || response.statusMessage != "OK") {
                                apiresponse.status = "problem";

                                apiresponse.trips.status = response.statusMessage;
                                apiresponse.trips.result = body;
                            }
                            else {
                                //console.log(body);
                                apiresponse.trips = body;
                            }

                            return res.render('atob.ejs', {
                                errors: req.flash('error'),
                                message: req.flash('message'),
                                origin: req.query.origin,
                                destination: req.query.destination,
                                travelmode: travelmode,
                                timevar: req.query.time,
                                apiresponse: apiresponse
                            }); // load the ejs file
                        });
                        //carpool api end
                    });
                    //emissions api end
                }
                else {
                    return res.render('atob.ejs', {
                        errors: req.flash('error'),
                        message: req.flash('message'),
                        origin: req.query.origin,
                        destination: req.query.destination,
                        travelmode: travelmode,
                        timevar: req.query.time,
                        apiresponse: apiresponse
                    }); // load the ejs file 
                }
            }
        });
        //route api end
    });
    //iplocator api end
});




/*
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

    if (!directionsBody.result || directionsBody.result.status != 'OK') {
        //directionsBody.result.emissions = "error";

        callback(null, directionsBody);
        //callback('Error');
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


                callback(null, directionsBody);
            }
        });
    }
};

var getCarpools = function(timevar, userId, directionsBody, callback) {

    // var timevar = Date.now();
    // if (req.query.time && req.query.time != "") {
    //     timevar = new Date(+req.query.time);
    // }
    if (!directionsBody.result || directionsBody.result.status != 'OK') {

        callback(null, directionsBody);
        //callback('Error');
    }
    else {
        var originlat = directionsBody.result.routes[0].legs[0].start_location.lat;
        var originlong = directionsBody.result.routes[0].legs[0].start_location.lng;
        var destinationlat = directionsBody.result.routes[0].legs[0].end_location.lat;
        var destinationlong = directionsBody.result.routes[0].legs[0].end_location.lng;

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
    }
};*/

module.exports = router;