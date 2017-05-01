// models/vehicle.js
// load the things we need
var mongoose = require('mongoose');
var mongoosastic = require('mongoosastic');
var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema;

// define the schema for our vehicle model
var vehicleSchema = Schema({
    Co2: {
        type: Number,
        default: 0
    },
    valmistenumero2: {
        type: String,
        default: ''
    }
});


// create the model for users and expose it to our app
/*userSchema.plugin(mongoosastic,{
  hosts:[
    'localhost:9200'
  ]
});*/
module.exports = mongoose.model('Vehicle', vehicleSchema);
