var express = require('express');
var router = express.Router();

var request = require("request");

var gpsDistance = require('../utils/GpsDistance.js');

// load up the trip model
var Trip = require('../models/trip');

var currentUserTrip = {};

// return trips whose origin and destination are within specified range compared to currentuser's trip.
var findTripsInRange = function(currentUserTrip, trips, range) {

    
    var tripsInRange = [];

    for (var i = 0; i < trips.length; i++) {

        var trip = trips[i];

        if (gpsDistance.kilometersBetweenGpsPoints(currentUserTrip.origin, trip.origin) < range &&
            gpsDistance.kilometersBetweenGpsPoints(currentUserTrip.destination, trip.destination) < range) {

            tripsInRange.push(trip);
        }

    }

    return tripsInRange;
};

router.get('/trips', function(req, res, next) {
    var timevar = Date.now();
    if (req.query.time && req.query.time != "") {
        //timevar = new Date(+req.query.time);
        timevar = res.locals.InputToDate(req.query.time);
    }
    var currentUserTrip = {
        userid: req.query.userid,
        origin: {
            lat: req.query.originlat,
            long: req.query.originlong
        },
        destination: {
            lat: req.query.destinationlat,
            long: req.query.destinationlong
        },
        time: timevar
    };

    var oneHourInMilliseconds = 3600000;
    var hoursBetweenTrips = 24 * oneHourInMilliseconds;

    var searchparams = {
        userid: {
            $ne: currentUserTrip.userid
        },
        time: {
            $lte: (+currentUserTrip.time + hoursBetweenTrips),
            $gte: (+currentUserTrip.time - hoursBetweenTrips)
        }
    };

    Trip.find(searchparams, function(err, trips) {
        if (err) {
            var apijson = {
                status: "error",
                result: err
            };
            res.send(JSON.stringify(apijson));
            console.error(err);
        }
        else {
            var tripsInRange = findTripsInRange(currentUserTrip, trips, 10);
            var apijson = {
                status: "OK",
                result: tripsInRange
            };
            res.send(JSON.stringify(apijson));
            console.log("Retrieved trips collection for user: " + currentUserTrip.userid);
        }

    });
});

router.post('/trip/new', function(req, res, next) {
    //var userid = req.body.userid;
    if (!req.user) {
        res.redirect('/denied');
    }

    var userid = req.user.id;
    var userEmail = req.user.google.email || req.user.local.email || '';
    var userPhone = req.user.local.phone || '';

    var originname = req.body.origin;
    var destinationname = req.body.destination;

    var originlat = req.body.originlat;
    var originlong = req.body.originlong;
    var destinationlat = req.body.destinationlat;
    var destinationlong = req.body.destinationlong;

    var time = Date.now();
    if (req.body.time && req.body.time != "") {
        //time = new Date(+req.body.time);
        console.log("Time:" + req.body.time);
        time = res.locals.InputToDate(req.body.time, res.locals.gmtoffset);
    }
    //var time = new Date(+req.query.time) || Date.now();

    var tripParams = {
        userid: userid,
        contactinfo: {
            email: userEmail,
            phone: userPhone
        },
        origin: {
            name: originname,
            lat: originlat,
            long: originlong
        },
        destination: {
            name: destinationname,
            lat: destinationlat,
            long: destinationlong
        },
        time: time
    };

    var newtrip = new Trip(tripParams);

    newtrip.save(function(err, newtrip) {
        if (err) {
            /*var apijson = {
                status: "error",
                result: err
            };
            res.send(JSON.stringify(apijson));*/

            req.flash('error', 'Failed to save trip.' + err);
            res.redirect(res.locals.referer);
            return console.error(err);
        }
        else {
            /*
            var apijson = {
                status: "OK",
                result: tripParams
            };
            res.send(JSON.stringify(apijson));*/

            req.flash('message', 'New trip added');
            res.redirect(res.locals.referer);
            console.log("New trip added: " + JSON.stringify(tripParams));
        }

    });
});


router.get('/trip/details', function(req, res) {
    var tripid = req.query.tripid || '';

    /* request({
        url: res.locals.hosturl + "/carpool_api?originlat=1&originlong=1&destinationlat=100&destinationlong=1&time=0,
        json: true
    }, function(error, response, body) {
        res.render('directions.ejs', {
            errors: req.flash('error'),
            message: req.flash('message'),
            origin: origin,
            destination: destination,
            travelmode: travelmode,
            apiresponse: body
        }); // load the ejs file
    });
    */

    /*if (!req.user) {
        res.redirect('/denied');
    }*/

    //var userid = req.user.id;

    var searchparams = {
        _id: tripid
    };

    Trip.findOne(searchparams, function(err, trip) {
        if (err) {
            var apijson = {
                status: "error",
                result: err
            };
            res.send(JSON.stringify(apijson));
            console.error(err);
        }
        else {
            var apijson = {
                status: "OK",
                result: trip
            };
            res.send(JSON.stringify(apijson));
            console.log("Retrieved trip id: " + tripid);
        }
    });
});


router.post('/trip/remove', function(req, res) {
    var tripid = req.body.tripid || '';

    /* request({
        url: res.locals.hosturl + "/carpool_api?originlat=1&originlong=1&destinationlat=100&destinationlong=1&time=0,
        json: true
    }, function(error, response, body) {
        res.render('directions.ejs', {
            errors: req.flash('error'),
            message: req.flash('message'),
            origin: origin,
            destination: destination,
            travelmode: travelmode,
            apiresponse: body
        }); // load the ejs file
    });
    */

    if (!req.user) {
        res.redirect('/denied');
    }

    var userid = req.user.id;

    var searchparams = {
        _id: tripid,
        userid: userid
    };

    Trip.findOne(searchparams, function(err, trip) {
        if (err) {
            /*
            var apijson = {
                status: "error",
                result: err
            };
            res.send(JSON.stringify(apijson));
            console.error(err);*/

            req.flash('error', err);
            res.redirect(res.locals.referer);
        }
        else {
            if (!trip) {
                /*
                var apijson = {
                    status: "error",
                    result: "not found"
                };
                res.send(JSON.stringify(apijson));
                console.error(err);*/

                req.flash('error', 'Trip not found');
                res.redirect(res.locals.referer);
            }
            else {
                /*
                var apijson = {
                    status: "OK",
                    result: trip
                };
                res.send(JSON.stringify(apijson));*/

                req.flash('message', 'Trip removed');
                res.redirect(res.locals.referer);

                trip.remove(function(err) {
                    if (err) {
                        console.error(err);
                    }
                    console.log("Removed trip id: " + tripid);
                });
            }


        }
    });
});


router.get('/usertrips', function(req, res) {
    //var tripid = req.query.tripid || '';
    var userid = req.query.userid;

    /* request({
        url: res.locals.hosturl + "/carpool_api?originlat=1&originlong=1&destinationlat=100&destinationlong=1&time=0,
        json: true
    }, function(error, response, body) {
        res.render('directions.ejs', {
            errors: req.flash('error'),
            message: req.flash('message'),
            origin: origin,
            destination: destination,
            travelmode: travelmode,
            apiresponse: body
        }); // load the ejs file
    });
    */

    /*if (!req.user) {
        res.redirect('/denied');
    }*/

    //var userid = req.user.id;

    var searchparams = {
        userid: userid
    };

    Trip.find(searchparams, function(err, trips) {
        if (err) {
            var apijson = {
                status: "error",
                result: err
            };
            res.send(JSON.stringify(apijson));
            console.error(err);
        }
        else {
            var apijson = {
                status: "OK",
                result: trips
            };
            res.send(JSON.stringify(apijson));
            console.log("Retrieved trips collection of user: " + userid);
        }

    });
});

router.post('/trip/join', function(req, res, next) {
    if (!req.user) {

        res.redirect('/denied');
    }

    var secret = require('../config/secret');
    var tripId = req.body.trip;
    var useremail = req.user.local.email || req.user.google.email;


    var searchparams = {
        _id: tripId,
    };

    Trip.findOne(searchparams, function(err, trip) {
        if (err) {
            req.flash('error', err);
            res.redirect(res.locals.referer);
        }
        else {
            if (!trip) {
                req.flash('error', 'Trip not found');
                res.redirect(res.locals.referer);
            }
            else {

                var nodemailer = require("nodemailer");

                var emailContent = "Hello!\nUsername " + useremail + " has requested to join " + trip.contactinfo.email + "'s carpool from " +
                    req.body.origin + " to " + req.body.destination + ".\n\n\nBest regards,\nAtoB services";

                var smtpTransport = nodemailer.createTransport({
                    service: "Gmail", // sets automatically host, port and connection security settings
                    auth: {
                        user: "atobcarpool@gmail.com",
                        pass: secret.gmail_pass
                    }
                });

                smtpTransport.sendMail({ //email options
                    from: "Carpooling <email@gmail.com>", // sender address.  Must be the same as authenticated user if using Gmail.
                    to: "<" + trip.contactinfo.email + ">, <" + useremail + ">", // receiver
                    cc: "<" + useremail + ">",
                    bcc: "<" + useremail + ">",
                    subject: "New carpool request", // subject
                    text: emailContent // body
                }, function(error, response) { //callback
                    if (error) {
                        console.log(error);
                    }
                    else {
                        console.log("Message sent: " + response.message);
                    }

                    smtpTransport.close(); // shut down the connection pool, no more messages.  Comment this line out to continue sending emails.
                });

                var responseText = 'Your request has been sent to ' + trip.contactinfo.email + '.';
                if (trip.contactinfo.phone) {
                    responseText = +' You can try to contact the driver with phonenumber: ' + trip.contactinfo.phone;
                }
                req.flash('message', responseText);
                res.redirect(res.locals.referer);

            }

        }
    });


});


module.exports = router;
