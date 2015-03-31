var walkMeApp = angular.module('walkMeApp', ['uiGmapgoogle-maps']);

walkMeApp.config(function (uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyBt1EnZ9lAjCx6nOu4iqUtFQ9sKnjOvGCE',
        v: '3.17',
        libraries: 'weather,geometry,visualization'
    });
})

walkMeApp.controller("mapController", function ($scope, uiGmapGoogleMapApi) {
    $scope.map = {
        center: {
            latitude: 45,
            longitude: -73
        },
        zoom: 8
    };
    uiGmapGoogleMapApi.then(function (maps) {
        var mapOptions = {
            zoom: 8,
            center: new google.maps.LatLng(-34.397, 150.644)
        };

        var map = new maps.Map(document.getElementById('map-canvas'),
            mapOptions)
    });
});