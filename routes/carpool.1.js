var express = require('express');
var router = express.Router();

var request = require("request");

router.get('/carpool_api', function(req, res, next) {
    var userid = req.query.userid;
    var originlat = req.query.originlat;
    var originlong = req.query.originlong;
    var destinationlat = req.query.destinationlat;
    var destinationlong = req.query.destinationlong;
    var time = new Date(+req.query.time) || Date.now();

    var trip = {
        userid: userid,
        origin: {
            lat: originlat,
            long: originlong
        },
        destination: {
            lat: destinationlat,
            long: destinationlong
        },
        time: time
    };

    var mongoClient = require('mongodb').MongoClient;
    var assert = require('assert');
    var url = require('../config/secret').db_database;

    mongoClient.connect(url, function(error, db) {
        assert.equal(null, error);
        insertDocument(db, trip);
        findTrips(db, trip, sendResponse);
    });

    var insertDocument = function(db, params) {
        db.collection('trips').insertOne({
            "userid": params.userid,
            "origin": {
                "lat": params.origin.lat,
                "long": params.origin.long
            },
            "destination": {
                "lat": params.destination.lat,
                "long": params.destination.long
            },
            "time": params.time
        }, function(err, result) {
            assert.equal(err, null);
            console.log("Inserted a document into the trips collection.");
        });
    };

    var findTrips = function(db, userTrip, callback) {
        db.collection('trips').find({
            "userid": {
                "$ne": userTrip.userid
            },
            "time": userTrip.time
        }).toArray(function(err, items) {
            assert.equal(err, null);
            var response = findTripsInRange(userTrip, items);
            db.close();
            callback(response);
        });
    };

    var findTripsInRange = function(userTrip, trips) {

        var gpsDistance = require('../utils/GpsDistance.js');
        var tripsInRange = [];

        for (var i = 0; i < trips.length; i++) {

            var trip = trips[i];

            if (gpsDistance.distanceBetweenGpsPoints(userTrip.origin, trip.origin) < 100 &&
                gpsDistance.distanceBetweenGpsPoints(userTrip.destination, trip.destination) < 100) {

                tripsInRange.push(trip);
            }

        }

        return tripsInRange;
    };

    var sendResponse = function(trips) {
        res.send(JSON.stringify(trips));
    };

});



module.exports = router;
