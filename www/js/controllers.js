walkMeApp.controller("mapController", function ($scope, uiGmapGoogleMapApi) {
    $scope.map = {
        center: {
            latitude: 40.712784,
            longitude: -74.005941,
            lat: 40.712784,
            lng: -74.005941
        },
        zoom: 17
    };
    uiGmapGoogleMapApi.then(function (maps) {
        walkMeApp.map = new maps.Map(document.getElementById('map-canvas'), $scope.map)
        walkMeApp.geocoder = new maps.Geocoder();
        walkMeApp.directionsService = new maps.DirectionsService();
        walkMeApp.directionsDisplay = new maps.DirectionsRenderer();
        walkMeApp.directionsDisplay.setMap(walkMeApp.map);
        walkMeApp.startInput = document.getElementsByName('startLocation')[0];
        walkMeApp.endInput = document.getElementsByName('endLocation')[0];
    });
});

walkMeApp.controller("formController", function ($scope, $state) {
    // send route to server
    $scope.sendRequest = function (addresses) {
        if (addresses.length != 2) {
            return;
        }

        // calculate route
        var directionsRequest = {
            origin: addresses[0],
            destination: addresses[1],
            travelMode: google.maps.TravelMode.WALKING,
            provideRouteAlternatives: true
        };
        walkMeApp.directionsService.route(directionsRequest, function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
//                walkMeApp.directionsDisplay.setDirections(response);

                var req = new XMLHttpRequest();
                var url = "http://104.236.249.124/api/";

                req.onreadystatechange = function () {
                    if (req.readyState == 4 && req.status == 200) {
                        var res = JSON.parse(req.responseText);
                        console.log(res);
                    }
                }

                var routejson = JSON.stringify(response.routes);
                req.open("POST", url, true);
                req.send(routejson);

                $state.go('routes');
            }
        });

    }

    // geocode each address in addresses
    $scope.codeAddresses = function (addresses) {
        addrLatLng = [];
        _.forEach(addresses, function (address) {
            walkMeApp.geocoder.geocode({
                'address': address
            }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var pos = results[0].geometry.location;
                    addrLatLng.push(new google.maps.LatLng(pos.lat(), pos.lng()));
                    $scope.sendRequest(addrLatLng);
                } else {
                    alert('Geocode was not successful for the following reason: ' + status);
                }
            });
        });
    }

    $scope.submitOnEnter = function (e) {
        // look for window.event in case event isn't passed in
        e = e || window.event;
        if (e.keyCode == 13) {
            if (walkMeApp.startInput.value == '' || walkMeApp.endInput.value == '')
                return;
            $scope.codeAddresses([walkMeApp.startInput.value, walkMeApp.endInput.value]);
        }
    }
});

walkMeApp.controller("footerController", function ($scope) {
    $scope.geolocate = function () {
        navigator.geolocation.getCurrentPosition(function (pos) {
            var latLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
            walkMeApp.map.setCenter(latLng);
//            var marker = new google.maps.Marker({
//                position: latLng,
//                map: walkMeApp.map
//            });

            walkMeApp.geocoder.geocode({
                'latLng': latLng
            }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[0]) {
                        walkMeApp.startInput.value = results[0].formatted_address;
                        walkMeApp.endInput.focus();
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