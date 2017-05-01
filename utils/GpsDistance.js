module.exports = {

    //http://www.movable-type.co.uk/scripts/latlong.html
    kilometersBetweenGpsPoints: function(point1, point2) {

        var R = 6371e3; // metres
        var φ1 = toRadians(point1.lat);
        var φ2 = toRadians(point2.lat);
        var Δφ = toRadians(point2.lat - point1.lat);
        var Δλ = toRadians(point2.long - point1.long);

        var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        var distanceBetweenPointsInKilometers = R * c / 1000;

        return distanceBetweenPointsInKilometers;
    }

};

var toRadians = function(value) {
    return value * Math.PI / 180;
}
