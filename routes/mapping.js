var User = require('../models/user');

User.createMapping(function(err, mapping) {
	if (err) {
		console.log('error creatingMapping');
		console.log(err);
	}
	else {
		console.log('Mapping created for User');
		console.log(mapping);
	}
});

var Trip = require('../models/trip');

Trip.createMapping(function(err, mapping) {
	if (err) {
		console.log('error creatingMapping');
		console.log(err);
	}
	else {
		console.log('Mapping created for Trip');
		console.log(mapping);
	}
});

var stream = User.synchronize();
var count1 = 0;
var errors1 = 0;
stream.on('data', function(err, doc) {
	//console.log("Indexed "+count1+" user documents with "+errors1+" errors");
	count1++;
});
stream.on('close', function() {
	console.log("Indexed " + count1 + " user documents with " + errors1 + " errors");
});
stream.on('error', function(err) {
	console.log(err);
	errors1++;
});

var stream = Trip.synchronize();
var count2 = 0;
var errors2 = 0;
stream.on('data', function(err, doc) {
	//console.log("Indexed "+count2+" trip documents with "+errors2+" errors");
	count2++;
});
stream.on('close', function() {
	console.log("Indexed " + count2 + " trip documents with " + errors2 + " errors");
});
stream.on('error', function(err) {
	console.log(err);
	errors2++;
});

module.exports = false;
