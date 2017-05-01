var express = require('express');
var router = express.Router();

var request = require("request");


router.get('/locate', function(req, res, next) {
    var ip = req.query.ip || '86.50.44.11';

    var url = "http://ip-api.com/json/" + res.locals.clientip;
    if (ip && ip != "") {
        url = "http://ip-api.com/json/" + ip;
    }


    request({
        url: url,
        json: true
    }, function(error, response, body) {

        if (!error && response.statusMessage == "OK") {
			var locationinfo = parseResponseBody(body);
			 var apijson = {
				status: "pending",
				result: locationinfo
			};
			if (locationinfo && locationinfo.city && locationinfo.country && locationinfo.latitude && locationinfo.longtitude)
			{
				apijson.status = "OK";
			}
			else
			{
				apijson.status = "problem";
			}
           
            res.send(JSON.stringify(apijson));
        }
        else {
            var apijson = {
                status: "error",
                error: error
            };
            res.send(JSON.stringify(apijson));
        }
    })

    var parseResponseBody = function(responseBody) {

        var locationInformation = {
            city: responseBody.city,
            country: responseBody.country,
            latitude: responseBody.lat,
            longtitude: responseBody.lon
        };

        return locationInformation;
    }

});

module.exports = router;
