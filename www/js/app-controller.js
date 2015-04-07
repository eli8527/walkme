/* --------------------------------------------------------------------------
| App Controller
|
| Defines globally used resources and functions (maps API, geolocation)
|-------------------------------------------------------------------------- */

app.controller("appController", function ($scope, $ionicPopover, uiGmapGoogleMapApi) {

    $scope.init = function () {
        // cache relevant DOM elements
        app.startInput = document.getElementsByName('startLocation')[0];
        app.endInput = document.getElementsByName('endLocation')[0];

        // used for rendering with angular-google-maps
        $scope.map = {
            center: {
                latitude: 40.712784,
                longitude: -74.005941,
                lat: 40.712784,
                lng: -74.005941
            },
            zoom: 12
        };
    }

    // Load Google maps resources (async call)
    uiGmapGoogleMapApi.then(function (maps) {
        $scope.init();
        app.map = new maps.Map(document.getElementById('map-canvas'), $scope.map)
        app.geocoder = new maps.Geocoder();
        app.directionsService = new maps.DirectionsService();
        app.directionsDisplay = new maps.DirectionsRenderer();
    });

    // Center map on user's current location
    $scope.geolocate = function () {
        navigator.geolocation.getCurrentPosition(function (pos) {
            var latLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
            app.map.setCenter(latLng);
            app.map.setZoom(17);

            // set start input value to current location
            app.geocoder.geocode({
                'latLng': latLng
            }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[0]) {
                        app.startInput.value = results[0].formatted_address;
                        app.endInput.focus();
                    } else {
                        alert('No results found');
                    }
                } else {
                    alert('Geocoder failed due to: ' + status);
                }
            });
        }, function (error) {
            alert('Unable to get location: ' + error.message);
        });
    };
});