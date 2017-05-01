var express = require('express');
var router = express.Router();

var User = require('../models/user');
var secret = require('../config/secret');
var config = require('../config/config');


var request = require("request");
var async = require("async");

var HOST_URL = "";

var passport = require('./passport');

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on 
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}


// =====================================
// LOGIN ===============================
// =====================================
// show the login form
router.get('/login', function(req, res) {

	// render the page and pass in any flash data if it exists
	res.render('login.ejs', {
		errors: req.flash('error'),
		message: req.flash('message')
	});
});

// process the login form
router.post('/login', passport.authenticate('local-login', {
	successRedirect: '/', // redirect to index
	failureRedirect: '/login', // redirect back to the signup page if there is an error
	failureFlash: true // allow flash messages
}));


// =====================================
// SIGNUP ==============================
// =====================================
// show the signup form
router.get('/signup', function(req, res) {

	// render the page and pass in any flash data if it exists
	res.render('signup.ejs', {
		errors: req.flash('error'),
		message: req.flash('message')
	});
});

// process the signup form
router.post('/signup', passport.authenticate('local-signup', {
	successRedirect: '/', // redirect to index
	failureRedirect: '/signup', // redirect back to the signup page if there is an error
	failureFlash: true // allow flash messages
}));

// =====================================
// PROFILE SECTION =====================
// =====================================
// we will want this protected so you have to be logged in to visit
// we will use route middleware to verify this (the isLoggedIn function)
router.get('/profile', isLoggedIn, function(req, res) {
	res.render('profile.ejs', {
		errors: req.flash('error'),
		message: req.flash('message'),
		user: req.user // get the user out of session and pass to template
	});
});

// =====================================
// LOGOUT ==============================
// =====================================
router.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

// =====================================
// GOOGLE ROUTES =======================
// =====================================
// send to google to do the authentication
// profile gets us their basic information including their name
// email gets their emails
router.get('/auth/google', passport.authenticate('google', {
	scope: ['profile', 'email']
}));

// the callback after google has authenticated the user
router.get('/auth/google/callback',
	passport.authenticate('google', {
		successRedirect: '/profile',
		failureRedirect: '/'
	}));

// TODO..
router.post('/updatevin', function(req, res) {
	var User = require('../models/user');
	User.findById(req.body.userid, function(err, user) {
		if (err) {}
		else {
			user.vehicleIdentificationNumber = req.body.vin;
			user.save(function(err, updatedUser) {
				if (err) {}
				else {
					res.redirect('/profile');
				}
			});
		}
	});
});


// =====================================
// HOME PAGE (with login links) ========
// =====================================
router.get('/', function(req, res) {

	var apiresponse = {};
	apiresponse.status = "OK";
	apiresponse.iplocation = {};
	apiresponse.usertrips = {};

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
		}

		if (req.user) {

			var userId = req.user.id || '';
			request({
				url: res.locals.hosturl + encodeURI('/carpool_api/usertrips?userid=' + userId),
				json: true
			}, function(error, response, body) {

				if (error || response.statusMessage != "OK") {
					apiresponse.status = "problem";

					apiresponse.usertrips.status = response.statusMessage;
					apiresponse.usertrips.result = body;
				}
				else {
					apiresponse.usertrips = body;
				}

				res.render('index.ejs', {
					errors: req.flash('error'),
					message: req.flash('message'),
					apiresponse: apiresponse
				}); // load the ejs file
			});
		}
		else {

			res.render('index.ejs', {
				errors: req.flash('error'),
				message: req.flash('message'),
				apiresponse: apiresponse
			}); // load the index.ejs file
		}
	});
});

// =====================================
// Single trip                  ========
// =====================================
router.get('/trip', function(req, res) {
	var tripid = req.query.tripid || '';

	var apiresponse = {};
	apiresponse.status = "OK";

	if (tripid && tripid != "") {

		//var userId = req.user.id || '';
		request({
			url: res.locals.hosturl + encodeURI('/carpool_api/trip/details?tripid=' + tripid),
			json: true
		}, function(error, response, body) {

			if (error || response.statusMessage != "OK") {
				apiresponse.status = "problem";

				apiresponse.trip.status = response.statusMessage;
				apiresponse.trip.result = body;
			}
			else {
				apiresponse.trip = body;
			}

			res.render('trip.ejs', {
				errors: req.flash('error'),
				message: req.flash('message'),
				apiresponse: apiresponse
			}); // load the ejs file
		});
	}
	else {
		res.redirect('/denied');
	}
});




module.exports = router;
