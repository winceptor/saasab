// routes/passport.js
var passport = require('passport');

// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// load up the user model
var User = require('../models/user');

// load the auth variables
var configAuth = require('../config/secret');


// =========================================================================
// passport session setup ==================================================
// =========================================================================
// required for persistent login sessions
// passport needs ability to serialize and unserialize users out of session

// used to serialize the user for the session
passport.serializeUser(function(user, done) {
	done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user) {
		done(err, user);
	});
});

// =========================================================================
// LOCAL SIGNUP ============================================================
// =========================================================================
// we are using named strategies since we have one for login and one for signup
// by default, if there was no name, it would just be called 'local'

passport.use('local-signup', new LocalStrategy({
		// by default, local strategy uses username and password, we will override with email
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true // allows us to pass back the entire request to the callback
	},
	function(req, email, password, done) {

		// asynchronous
		// User.findOne wont fire unless data is sent back
		process.nextTick(function() {

			// find a user whose email is the same as the forms email
			// we are checking to see if the user trying to login already exists
			User.findOne({
				'local.email': email
			}, function(err, user) {
				// if there are any errors, return the error
				if (err)
					return done(err);

				// check to see if theres already a user with that email
				if (user) {
					return done(null, false, req.flash('message', '###emailtakenerror###'));
				}
				else {

					// if there is no user with that email
					// create the user
					var newUser = new User();

					// set the user's local credentials
					newUser.local.email = email;
					//newUser.local.password = newUser.generateHash(password);
					newUser.local.password = password;

					newUser.lastlogin = Date.now();

					newUser.lastip = req.connection.remoteAddress || req.socket.remoteAddress || "invalid";

					// save the user
					newUser.save(function(err) {
						if (err)
							throw err;
						return done(null, newUser);
					});
				}

			});

		});

	}
));

passport.use('local-login', new LocalStrategy({
	usernameField: 'email',
	passwordField: 'password',
	passReqToCallback: true
}, function(req, email, password, done) {
	email = email.toLowerCase();
	User.findOne({
		'local.email': email
	}, function(err, user) {
		if (err) return done(err);

		if (!user) {
			return done(null, false, req.flash('message', '###usernameerror###'));
		}
		if (!user.validPassword(password)) {
			return done(null, false, req.flash('message', '###passworderror###'));
		}

		user.lastlogin = Date.now();
		user.lastip = req.connection.remoteAddress || req.socket.remoteAddress || "invalid";

		user.save(function(err) {
			if (err) return console.log(err);
		});

		req.flash('message', '###loginsuccess###')
		return done(null, user);
	});
}));

// =========================================================================
// GOOGLE ==================================================================
// =========================================================================
passport.use(new GoogleStrategy({


		clientID: configAuth.googleAuth.clientID,
		clientSecret: configAuth.googleAuth.clientSecret,
		callbackURL: configAuth.googleAuth.callbackURL,
		passReqToCallback: true

	},
	function(req, token, refreshToken, profile, done) {

		// make the code asynchronous
		// User.findOne won't fire until we have all our data back from Google
		process.nextTick(function() {

			// try to find the user based on their google id
			User.findOne({
				'google.id': profile.id
			}, function(err, user) {
				if (err)
					return done(err);

				if (user) {

					//first check if user is already logged in
					if (req.user) {
						/*
						User.findOne({
							'_id': req.user._id
						}, function(err, user) {
							if (err)
								return done(err);
*/
						var currentuser = req.user;

						currentuser.google = user.google;


						currentuser.lastlogin = Date.now();

						//replace local user by merging with google
						user.remove(function(err) {
							if (err)
								throw err;
						});

						// link the user
						currentuser.save(function(err) {
							if (err)
								throw err;
							return done(null, currentuser);
						});
						//});
					}
					else {

						// if a user is found, log them in
						return done(null, user);
					}
				}
				else {
					if (req.user) {
						/*
						User.findOne({
							'_id': req.user._id
						}, function(err, user) {
							if (err)
								return done(err);
*/
						var currentuser = req.user;

						// set all of the relevant information
						currentuser.google.id = profile.id;
						currentuser.google.token = token;
						currentuser.google.name = profile.displayName;
						currentuser.google.email = profile.emails[0].value; // pull the first email
						//currentuser.local.email = profile.emails[0].value;
						currentuser.lastlogin = Date.now();

						// link the user
						currentuser.save(function(err) {
							if (err)
								throw err;
							return done(null, currentuser);
						});
						//});
					}
					else {
						// if the user isnt in our database, create a new user
						var newUser = new User();

						// set all of the relevant information
						newUser.google.id = profile.id;
						newUser.google.token = token;
						newUser.google.name = profile.displayName;
						newUser.google.email = profile.emails[0].value; // pull the first email
						//newUser.local.email = profile.emails[0].value;
						newUser.lastlogin = Date.now();

						// save the user
						newUser.save(function(err) {
							if (err)
								throw err;
							return done(null, newUser);
						});
					}
				}
			});
		});
	}));


module.exports = passport;
