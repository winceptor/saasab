$(document).ready(function() {
    /*
    function geoFindMe() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(success, error, geoOptions);
        }
        else {
            console.log("Geolocation services are not supported by your web browser.");
        }
    }

    function success(position) {
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        var altitude = position.coords.altitude;
        var accuracy = position.coords.accuracy;
        console.log("lat: " + latitude + " long: " + longitude);
    }

    function error(error) {
        console.log("Unable to retrieve your location due to " + error.code + ": " + error.message);
    }

    var geoOptions = {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 27000
    };*/

    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition, showError);
        }
        else {
            console.log("Geolocation is not supported by this browser.");
        }
    }

    function showError(error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                console.log("User denied the request for Geolocation.");
                break;
            case error.POSITION_UNAVAILABLE:
                console.log("Location information is unavailable.");
                break;
            case error.TIMEOUT:
                console.log("The request to get user location timed out.");
                break;
            case error.UNKNOWN_ERROR:
                console.log("An unknown error occurred.");
                break;
        }
    }

    function showPosition(position) {
        console.log("Latitude: " + position.coords.latitude + "<br>Longitude: " + position.coords.longitude);

        document.getElementById('autolocation').value = position.coords.latitude + "," + position.coords.longitude;
    }

    getLocation();
});
