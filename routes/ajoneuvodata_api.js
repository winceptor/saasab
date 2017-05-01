var express = require('express');
var router = express.Router();

var request = require("request");

var Vehicle = require('../models/vehicle');

var DEFAULT_CO2 = 150;

var EXAMPLE_C02_VALUES = [
    ['red meat', 'kg', 22000],
    ['chicken', 'kg', 6000],
    ['PC', 'pcs', 61000],
    ['magazines', 'pcs', 1900]
];


router.get('/data', function(req, res, next) {
    var vehicleId = req.query.vehicleId || '';
    var distanceInkms = req.query.distance || 1;

    var parameters = {
        valmistenumero2: vehicleId
    };

    if (!vehicleId || vehicleId == "") {
        var Co2 = Math.round(DEFAULT_CO2 * distanceInkms);
        var result = {
            Co2: Co2,
            Comparison: getCo2Comparison(Co2)
        };
        var apijson = {
            status: "OK",
            result: result
        };
        return res.send((JSON.stringify(apijson)));
    }

    Vehicle.findOne(parameters, function(err, ajoneuvodata) {
        if (err) {
            var apijson = {
                status: "error",
                result: err
            };
            console.error(err);
            return res.send(JSON.stringify(apijson));
        }
        else {

            var Co2 = 0;
            if (ajoneuvodata && ajoneuvodata.Co2 && ajoneuvodata.Co2 > 0) {
                Co2 = Math.round(ajoneuvodata.Co2 * distanceInkms);
                var result = {
                    Co2: Co2,
                    Comparison: getCo2Comparison(Co2)
                };
                var apijson = {
                    status: "OK",
                    result: result
                };
                return res.send((JSON.stringify(apijson)));
            }
            else {
                Co2 = Math.round(DEFAULT_CO2 * distanceInkms);
                var result = {
                    Co2: Co2,
                    Comparison: getCo2Comparison(Co2)
                };
                var apijson = {
                    status: "notfound",
                    result: result
                };
                return res.send((JSON.stringify(apijson)));
            }


        }
    });
});

var getCo2Comparison = function(Co2) {

    var i = Math.floor(Math.random() * 3.99);
    var x = Math.round((Co2 / EXAMPLE_C02_VALUES[i][2]) * 100) / 100;

    return "By carpooling this trip you reduce the Co2 emissions equal to the production of " + x + ' ' + EXAMPLE_C02_VALUES[i][1] +
        ' of ' + EXAMPLE_C02_VALUES[i][0] + '.';
};

router.get('/search', function(req, res, next) {
    var query = req.query.query;

    var searchparams = {
        valmistenumero2: new RegExp('^' + query, 'i')
    }

    Vehicle.find(searchparams, function(err, ajoneuvodata) {
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
                result: ajoneuvodata
            };
            res.send((JSON.stringify(apijson)));
        }
    }).limit(20);
});

module.exports = router;
