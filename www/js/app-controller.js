/* --------------------------------------------------------------------------
| App Controller
|
| Defines globally used resources
|-------------------------------------------------------------------------- */

app.controller("appController", function ($scope, uiGmapGoogleMapApi) {

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
});