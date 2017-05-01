var express = require('express');
var router = express.Router();

var request = require("request");


router.get('/weather', function(req, res, next) {
    var lat = req.query.lat || 60.9799;
    var long = req.query.long || 28.2608;

    getClosestWeatherStationWeather(lat, long, res);

});

module.exports = router;

var getClosestWeatherStationWeather = function(latitude, longitude, res) {

    var url = "https://tie.digitraffic.fi/api/v1/metadata/weather-stations";

    request({
        url: url,
        json: true,

    }, function(error, response, body) {

        if (!error && response.statusCode === 200) {

            var shortestDistance = 1000000000000;
            var shortestDistanceId = '';

            for (var i = 0; i < body.features.length; i++) {

                var position = {
                    lat: latitude,
                    long: longitude
                };
                var currentStation = body.features[i];
                var stationPosition = {
                    lat: currentStation.geometry.coordinates[1],
                    long: currentStation.geometry.coordinates[0]
                };
                var gpsDistance = require('../utils/GpsDistance.js');

                var distanceToStation = gpsDistance.kilometersBetweenGpsPoints(position, stationPosition);

                if (distanceToStation < shortestDistance) {
                    shortestDistance = distanceToStation;
                    shortestDistanceId = currentStation.id
                }

            }

            console.log(shortestDistance);
            console.log(shortestDistanceId);
            getWeatherInfo(res, shortestDistanceId);

        }
        else {

        }


    })

}

var getWeatherInfo = function(res, id) {

    var url = "https://tie.digitraffic.fi/api/v1/data/weather-data/" + id;

    request({
        url: url,
        json: true
    }, function(error, response, body) {

        if (!error && response.statusCode === 200) {
            var apijson = {
                status: "success",
                result: body
            };
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
}
