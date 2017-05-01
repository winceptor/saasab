// models/trip.js
// load the things we need
var mongoose = require('mongoose');
var mongoosastic = require('mongoosastic');
var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema;

// define the schema for our trip model
var tripSchema = Schema({
    userid: {
        type: String,
        default: ''
    },
    contactinfo: {
        email: {
            type: String,
            default: ''
        },
        phone: {
            type: String,
            default: ''
        },
    },
    origin: {
        name: {
            type: String,
            default: ''
        },
        lat: Number,
        long: Number
    },
    destination: {
        name: {
            type: String,
            default: ''
        },
        lat: Number,
        long: Number
    },
    time: {
        type: Date,
        default: Date.now
    }
});


// create the model for users and expose it to our app
/*userSchema.plugin(mongoosastic,{
  hosts:[
    'localhost:9200'
  ]
});*/
module.exports = mongoose.model('Trip', tripSchema);
