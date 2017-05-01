var express = require('express');
var router = express.Router();

var request = require("request");

var secret = require('../config/secret');


// Geocode an address.
/*
googleMapsClient.geocode({
    address: 'Liesharjunkatu 11, Lappeenranta, Finland'
}, function(err, response) {
    if (!err) {
        console.log("Geocode:");
        console.log(response.json.results);
    }
});

*/

/*
googleMapsClient.directions({
        origin: 'Lappeenranta',
        destination: 'Helsinki',
    },
    function(err, response) {
        if (!err) {
            console.log("routes:");
            console.log(response.json.routes);

            console.log("routes[0].legs:");
            console.log(response.json.routes[0].legs);

            console.log("routes[0].legs[0].distance:");
            console.log(response.json.routes[0].legs[0].distance);
        }
    })
    
*/

/*

googleMapsClient.distanceMatrix({
        origins: ['Lappeenranta'],
        destinations: ['Helsinki'],
        language: 'en',
        units: 'metric',
    },
    function(err, response) {
        if (!err) {
            console.log("DistanceMatrix:");
            console.log(response.json);
        }
    })
*/

router.get('/route', function(req, res, next) {
    //var options = req.query.options || '';

    var origin = req.query.origin || 'Lappeenranta';
    var destination = req.query.destination || 'Helsinki';
    var travelmode = req.query.travelmode || 'DRIVING';

    // var url = "apiurlhere";
    var url = "https://maps.googleapis.com/maps/api/directions/json?key=" + secret.google_maps_key;

    var apijson = {};
    apijson.status = "OK";

    request({
        url: url + encodeURI("&origin=" + origin + "&destination=" + destination),
        json: true,

    }, function(error, response, body) {
        if (error || response.statusMessage != "OK") {
            var apijson = {
                status: response.statusMessage,
                result: error
            };
            return res.send(JSON.stringify(apijson));
        }
        else {

            if (body.status == "OK") {
                var route = body.routes[0].legs[0];
                route.steps = null;
                var apijson = {
                    status: "OK",
                    result: route
                };
                return res.send(JSON.stringify(apijson));
            }
            else {
                return res.send(JSON.stringify(body));
            }
        }
    });

    /*    
    var apijson = {
        status: "timeout",
        result: {}
    };
    return res.send(JSON.stringify(apijson));*/
});

router.get('/route0', function(req, res, next) {
    //var options = req.query.options || '';

    var origin = req.query.origin || 'Lappeenranta';
    var destination = req.query.destination || 'Helsinki';
    var travelmode = req.query.travelmode || 'DRIVING';

    // var url = "apiurlhere";

    googleMapsClient.directions({
            origin: origin,
            destination: destination
        },
        function(error, response, body) {
            console.log("Response ok!");
            if (!error) {
                console.log("No error!");
                //console.log("Directions:");
                //console.log(response.json.routes[0].legs[0]);

                var route = response.json.routes[0].legs[0];
                console.log("Still works...");

                var apijson = {
                    status: "OK",
                    result: route
                        //result: response.json
                };
                return res.send(JSON.stringify(apijson));
            }
            else {
                console.log("There was a problem!");
                var apijson = {
                    status: response.statusMessage,
                    result: error
                };
                return res.send(JSON.stringify(apijson));
            }
        });
    /*    
    var apijson = {
        status: "timeout",
        result: {}
    };
    return res.send(JSON.stringify(apijson));*/
});

module.exports = router;
