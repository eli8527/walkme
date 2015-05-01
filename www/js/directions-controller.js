app.controller("directionsController", function ($scope, uiGmapGoogleMapApi, $ionicPopup) {

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

        $scope.loaded = false;
        $scope.$on("$ionicView.enter", function () {
            if ($scope.map) {
                // make sure the route polyline shows on return from directions view
                app.directionsDisplay.setMap($scope.map);
                // prevent map rendering bug
                maps.event.trigger($scope.map, 'resize');
            }

            if ($scope.loaded) {
                return;
            }

            // set the preview map height to fit screen
            var mapHeight = document.getElementById('directions-view-container').clientHeight - document.getElementById('directions-container').clientHeight;
            if (mapHeight < 300) mapHeight = 300;
            document.getElementById('directions-map-canvas').style.height = mapHeight + 'px';

            $scope.map = new maps.Map(document.getElementById('directions-map-canvas'), $scope.mapOptions);
            app.directionsDisplay.setMap($scope.map);
            $scope.loaded = true;


        });
    });

    // Center map on user's current location
    $scope.geolocate = function () {
        navigator.geolocation.getCurrentPosition(function (pos) {
            var latLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
            $scope.map.setCenter(latLng);

            // drop marker on current location
            if ($scope.marker) $scope.marker.setMap(null);
            $scope.marker = new google.maps.Marker({
                position: latLng,
                map: $scope.map
            });
        }, function (error) {
            var popup = $ionicPopup.alert({
                title: ':(',
                template: 'Geolocation not supported!'
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