app.controller("routeController", function ($scope, uiGmapGoogleMapApi, $ionicPopup) {

    uiGmapGoogleMapApi.then(function (maps) {
        $scope.mapOptions = {
            center: {
                latitude: 40.712784,
                longitude: -74.005941,
                lat: 40.712784,
                lng: -74.005941
            },
            zoom: 12,
            disableDefaultUI: true
        };

        $scope.map = new maps.Map(document.getElementById('directions-map-canvas'), $scope.mapOptions);

        $scope.$on("$ionicView.enter", function () {
            app.directionsDisplay.setMap($scope.map);
        });

    });

    // Center map on user's current location
    $scope.geolocate = function () {
        navigator.geolocation.getCurrentPosition(function (pos) {
            var latLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
            $scope.map.setCenter(latLng);
            $scope.map.setZoom(17);

            // drop marker on current location
            if ($scope.marker) $scope.marker.setMap(null);
            $scope.marker = new google.maps.Marker({
                position: latLng,
                map: $scope.map
            });

//            var infowindow = new google.maps.InfoWindow({
//                content: '<p class="infowindow">You are here!</p>'
//            });
//            infowindow.open($scope.map, $scope.marker);

        }, function (error) {
            var popup = $ionicPopup.alert({
                title: ':(',
                template: error
            });
            document.onkeypress = function (e) {
                e = e || window.event;
                if (e.keyCode === 13) {
                    if (popup) {
                        popup.close();
                    }
                }
            };
            console.log('Unable to get location: ' + error.message);
        });
    };

    app.directionsDisplay.setPanel(document.getElementById('directions-panel'));

});