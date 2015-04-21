app.controller("homeController", function ($scope, $state, $ionicLoading, $ionicPopup, uiGmapGoogleMapApi) {

    $scope.init = function () {
        // cache relevant DOM elements
        $scope.startInput = document.getElementsByName('startLocation')[0];
        $scope.endInput = document.getElementsByName('endLocation')[0];

        // used for rendering with angular-google-maps
        // default center on New York
        $scope.mapOptions = {
            center: {
                latitude: 40.712784,
                longitude: -74.005941,
                lat: 40.712784,
                lng: -74.005941
            },
            zoom: 12
        };

        // set the map height to match window size
        document.getElementById('map-canvas').style.height =
            document.getElementById('map-container').clientHeight -
            document.getElementById('map-form').clientHeight + 'px';
    }

    // Load Google maps resources (async call)
    uiGmapGoogleMapApi.then(function (maps) {
        $scope.init();
        $scope.map = new maps.Map(document.getElementById('map-canvas'), $scope.mapOptions);
        $scope.geocoder = new maps.Geocoder();
        $scope.bounds = new google.maps.LatLngBounds(new google.maps.LatLng(40.491370, -74.259090), new google.maps.LatLng(40.915256, -73.700272));
        $scope.directionsService = new maps.DirectionsService();
    });

    // Make a popup with given error message
    $scope.showAlert = function (error) {
        $scope.startInput.blur();
        $scope.endInput.blur();
        var popup = $ionicPopup.alert({
            title: ':(',
            template: error
        });
        document.onkeypress = function (e) {
            e = e || window.event;
            if (e.keyCode == 13) {
                if (popup) {
                    popup.close();
                }
            }
        };
    };

    $scope.switchInputs = function () {
        var start = $scope.startInput.value;
        $scope.startInput.value = $scope.endInput.value;
        $scope.endInput.value = start;
    }

    // Send a JSON request to the server for safety indices of paths
    $scope.requestSafetyIndices = function (addresses) {
        // make sure both addresses have been geocoded
        if (addresses.length != 2) {
            return;
        }

        // request walking routes from Google maps
        var directionsRequest = {
            origin: addresses[0],
            destination: addresses[1],
            travelMode: google.maps.TravelMode.WALKING,
            provideRouteAlternatives: true
        };

        // send request for safety index to the server
        $scope.directionsService.route(directionsRequest, function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                var req = new XMLHttpRequest();
                var url = "http://104.236.249.124/api/";

                // this block is executed upon server response
                req.onreadystatechange = function () {
                    if (req.readyState == 4 && req.status == 200) {
                        $ionicLoading.hide();
                        var res = JSON.parse(req.responseText);

                        // make info available to view
                        $scope.$parent.routeInfo = response;

                        _.forEach(res.indices, function (index, i) {
                            $scope.$parent.routeInfo.routes[i].index = (Math.round(index * 10) / 10).toFixed(1);
                            if (index < 0) {
                                $scope.$parent.routeInfo.routes[i].index = 'N/A';
                            }
                        });
                        
                        $state.go('options');

                    }
                }

                var routejson = JSON.stringify(response.routes);
                req.open("POST", url, true);
                req.send(routejson);

                // display loading icon while waiting for response
                $ionicLoading.show();
            } else {
                $scope.showAlert("No walking routes available!");
            }
        });
    }

    // Geocode the start and end address and submit request
    $scope.submitOnEnter = function (e) {
        // look for window.event in case event isn't passed in
        e = e || window.event;
        
        if (e.keyCode == 13) {
            // make sure both input fields are populated
            if ($scope.startInput.value == '' || $scope.endInput.value == '')
                return;

            // array containing lat/lng of start and end addresses
            var addrLatLng = [];

            // geocode the start address
            $scope.geocoder.geocode({
                'address': $scope.startInput.value,
                'bounds': $scope.bounds
            }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var pos = results[0].geometry.location;
                    addrLatLng.push(new google.maps.LatLng(pos.lat(), pos.lng()));
                    $scope.requestSafetyIndices(addrLatLng); // workaround for async call
                } else {
                    $scope.showAlert("We couldn't find your start address!");
                }
            });

            // geocode the end address
            $scope.geocoder.geocode({
                'address': $scope.endInput.value,
                'bounds': $scope.bounds
            }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var pos = results[0].geometry.location;
                    addrLatLng.push(new google.maps.LatLng(pos.lat(), pos.lng()));
                    $scope.requestSafetyIndices(addrLatLng); // workaround for async call
                } else {
                    $scope.showAlert("We couldn't find your destination address!");
                }
            });
        }
    }

    // Center map on user's current location
    $scope.geolocate = function () {
        
        navigator.geolocation.getCurrentPosition(function (pos) {
            var latLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
            $scope.map.setCenter(latLng);
            $scope.map.setZoom(17);

            // set start input value to current location
            $scope.geocoder.geocode({
                'latLng': latLng
            }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[0]) {
                        $scope.startInput.value = results[0].formatted_address;
                        cordova.plugins.Keyboard.close();
                        //$scope.endInput.focus();
                    } else {
                        alert('No results found');
                    }
                } else {
                    alert('Geocoder failed due to: ' + status);
                }
            });
        }, function (error) {
            $scope.showAlert('Geolocation not supported!');
            console.log('Unable to get location: ' + error.message);
        });
    };

});