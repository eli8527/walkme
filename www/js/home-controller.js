app.controller("homeController", function ($scope, $state, $ionicLoading, $ionicPopup, uiGmapGoogleMapApi) {

    $scope.init = function () {
        // cache relevant DOM elements
        $scope.startInput = document.getElementById('start-input');
        $scope.endInput = document.getElementById('end-input');

        // used for rendering with angular-google-maps
        // default center on New York
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

        // set the map height to match window size
        document.getElementById('map-canvas').style.height =
            document.getElementById('map-container').clientHeight -
            document.getElementById('map-form').clientHeight + 'px';

        // shows welcome only on first launch
        if (!localStorage.getItem("hasViewedIntro")) {
            $scope.showWelcome();
            localStorage.setItem("hasViewedIntro", "true");
        }
    };

    // Drop a marker on the map
    $scope.addMarker = function (location, element) {
        var marker = new google.maps.Marker({
            position: location,
            map: $scope.map
        });

        // clear preexisting marker
        if (element === $scope.startInput) {
            if ($scope.startMarker) {
                $scope.startMarker.setMap(null);
            }
            $scope.startMarker = marker;
        } else {
            if ($scope.endMarker) {
                $scope.endMarker.setMap(null);
            }
            $scope.endMarker = marker;
        }

        // resize map to fit new marker
        $scope.markerBounds.extend(marker.getPosition());
        $scope.map.fitBounds($scope.markerBounds);
    };

    // Configure autocomplete and associated callbacks
    $scope.setUpAutocomplete = function (element) {
        var autocomplete = new google.maps.places.Autocomplete(element, {
            bounds: $scope.bounds
        });

        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            var place = autocomplete.getPlace();
            if (!place.geometry) {
                return;
            }
            $scope.addMarker(place.geometry.location, element);
        });
    };

    // Load Google maps resources (async call)
    uiGmapGoogleMapApi.then(function (maps) {
        $scope.init();
        $scope.markerBounds = new maps.LatLngBounds();
        $scope.bounds = new maps.LatLngBounds(new google.maps.LatLng(40.491370, -74.259090), new google.maps.LatLng(40.915256, -73.700272));
        $scope.map = new maps.Map(document.getElementById('map-canvas'), $scope.mapOptions);
        $scope.geocoder = new maps.Geocoder();
        $scope.directionsService = new maps.DirectionsService();
        $scope.setUpAutocomplete($scope.startInput);
        $scope.setUpAutocomplete($scope.endInput);

        // prevent map rendering bug on reentering the view
        $scope.$on('$ionicView.enter', function () {
            maps.event.trigger($scope.map, 'resize');
        });
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
            if (e.keyCode === 13) {
                if (popup) {
                    popup.close();
                }
            }
        };
    };

    // Make a popup with welcome
    $scope.showWelcome = function () {
        $scope.startInput.blur();
        $scope.endInput.blur();
        var popup = $ionicPopup.alert({
            title: 'Welcome',
            template: 'Welcome to WalkMe NYC! To learn more, click the info button in the upper right corner.'
        });
        document.onkeypress = function (e) {
            e = e || window.event;
            if (e.keyCode === 13) {
                if (popup) {
                    popup.close();
                }
            }
        };
    };

    // Clear the start input field and associated marker
    $scope.clearStart = function () {
        $scope.startInput.blur();
        if ($scope.startMarker) {
            $scope.startMarker.setMap(null);
        }
        $scope.startInput.value = '';
    }

    // Clear the end input field and associated marker
    $scope.clearEnd = function () {
        $scope.endInput.blur();

        if ($scope.endMarker) {
            $scope.endMarker.setMap(null);
        }
        $scope.endInput.value = '';
    }

    // Is the start input field populated?
    $scope.hasStartInput = function () {
        if (!$scope.startInput) return false;
        return $scope.startInput.value !== '';
    }

    // Is the destination input field populated?
    $scope.hasEndInput = function () {
        if (!$scope.endInput) return false;
        return $scope.endInput.value !== '';
    }

    // Send a JSON request to the server for safety indices of paths
    $scope.requestSafetyIndices = function (addresses) {
        // make sure both addresses have been geocoded
        if (addresses.length !== 2) {
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

                        // we need to save the response object to render directions later
                        $scope.$parent.routeInfo = response;
                        for (var i = 0; i < response.routes.length; i++) {
                            var route = $scope.$parent.routeInfo.routes[i];
                            route.safetyIndex = res.indices[i];
                            route.numCrimes = res.numCrimes[i];
                            route.severity = res.severity[i];
                            console.log([route.safetyIndex, route.numCrimes, route.severity]);
                        }

                        // sort the routes according to decreasing safety index
                        $scope.$parent.routeInfo.routes.sort(function (route1, route2) {
                            if (route1.safetyIndex < route2.safetyIndex) return 1;
                            else if (route1.safetyIndex > route2.safetyIndex) return -1;
                            return 0;
                        });

                        $scope.startInput.blur();
                        $scope.endInput.blur();
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
    $scope.submit = function () {
        // make sure both input fields are populated
        if ($scope.startInput.value == '' || $scope.endInput.value == '')
            return;

        // array containing lat/lng of start and end addresses
        var addrLatLng = [];

        // geocode the start address
        $scope.geocoder.geocode({
            'address': $scope.startInput.value
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
            'address': $scope.endInput.value
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

    $scope.handleKeydownOnInput = function (e) {
        // look for window.event in case event isn't passed in
        e = e || window.event;

        // submit form on enter
        if (e.keyCode === 13) {
            e.preventDefault(); // prevent ng-click on clear button from firing
            $scope.submit();
        }

        // focus on other input on tab
        else if (e.keyCode === 9) {
            e.preventDefault();
            if ($scope.startInput === document.activeElement)
                $scope.endInput.focus();
            else if ($scope.endInput === document.activeElement)
                $scope.startInput.focus();
        }
    };

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
                        $scope.addMarker(latLng, $scope.startInput);

                        // resign keyboard
                        cordova.plugins.Keyboard.close();
                    } else {
                        $scope.showAlert('We couldn\'t find your location!');
                    }
                } else {
                    $scope.showAlert('Geocoder failed due to: ' + status);
                }
            });
        }, function (error) {
            $scope.showAlert('Geolocation not supported!');
            console.log('Unable to get location: ' + error.message);
        });
    };

    // google maps click on source
    $scope.disableTapStart = function () {
        container = document.getElementsByClassName('pac-container');
        // disable ionic data tab
        angular.element(container).attr('data-tap-disabled', 'true');
        // leave input field if google-address-entry is selected
        angular.element(container).on("click", function () {
            $scope.startInput.blur();
        });
    };

    // google maps click on destination and submit to process
    $scope.disableTapEnd = function () {
        container = document.getElementsByClassName('pac-container');
        // disable ionic data tab
        angular.element(container).attr('data-tap-disabled', 'true');
        // leave input field if google-address-entry is selected - auto go to get directions
        angular.element(container).on("click", function () {
            $scope.endInput.blur();
            $scope.submit();
        });
    };
});