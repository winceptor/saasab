    function initMap() {
        var directionsService = new google.maps.DirectionsService;
        var directionsDisplay = new google.maps.DirectionsRenderer;
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 3,
            center: {
                lat: 61.9241,
                lng: 25.7482
            }
        });
        directionsDisplay.setMap(map);
        //console.log(<%- apiresponse %>);
        //var mapdata = <%- apiresponse %>;
        //console.log("Server:");
        //console.log(mapdata.result);
        //var parsedresponse = JSON.parse('<%- apiresponse %>');
        //console.log(parsedresponse);
        //directionsDisplay.setDirections( mapdata.result );

        //var onChangeHandler = function() {
        //calculateAndDisplayRoute(directionsService, directionsDisplay);
        //};
        //document.getElementById('start').addEventListener('change', onChangeHandler);
        //document.getElementById('end').addEventListener('change', onChangeHandler);

        //try to locate client accurately
        function getLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition, showError);
                //setTimeout(function(){ getLocation(); }, 9000);
            }
            else {
                console.log("Geolocation is not supported by this browser.");
            }
        }

        function showError(error) {
            calculateAndDisplayRoute(directionsService, directionsDisplay);
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
            calculateAndDisplayRoute(directionsService, directionsDisplay, position);


        }

        getLocation();
    }

    function calculateAndDisplayRoute(directionsService, directionsDisplay, position) {
        var originposition = "<%= origin %>";
        if (position && false) {
            //originposition = position.coords.latitude + "," + position.coords.longitude;
            originposition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        }
        directionsService.route({
            //origin: document.getElementById('start').value,
            //destination: document.getElementById('end').value,
            origin: originposition,
            destination: "<%= destination %>",
            travelMode: "<%= travelmode %>"
        }, function(response, status) {
            if (status === 'OK') {
                directionsDisplay.setDirections(response);
                //console.log("Client:");
                //console.log(response);
            }
            else {
                window.alert('Directions request failed due to ' + status);
            }
        });
    }
    