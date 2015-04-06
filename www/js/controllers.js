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
        walkMeApp.geocoder = new google.maps.Geocoder();
        walkMeApp.directionsService = new google.maps.DirectionsService();
        walkMeApp.directionsDisplay = new google.maps.DirectionsRenderer();
        walkMeApp.directionsDisplay.setMap(walkMeApp.map);
    });
});

walkMeApp.controller("formController", function ($scope) {
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
                walkMeApp.directionsDisplay.setDirections(response);
                
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
                
//                document.getElementById('searchForm').reset();
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
            var startInput = document.getElementsByName('startLocation')[0];
            var endInput = document.getElementsByName('endLocation')[0];
            if (startInput.value == '' || endInput.value == '')
                return;
            $scope.codeAddresses([startInput.value, endInput.value]);
        }
    }
});

walkMeApp.controller("footerController", function ($scope) {
    $scope.geolocate = function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var pos = new google.maps.LatLng(position.coords.latitude,
                    position.coords.longitude);
                walkMeApp.map.setCenter(pos);
                var marker = new google.maps.Marker({
                    position: pos,
                    map: walkMeApp.map
                });

            }, function () {
                $scope.handleNoGeolocation(true);
            });
        } else {
            // Browser doesn't support Geolocation
            $scope.handleNoGeolocation(false);
        }
    }

    $scope.handleNoGeolocation = function (errorFlag) {
        if (errorFlag) {
            var content = 'Error: The Geolocation service failed.';
        } else {
            var content = 'Error: Your browser doesn\'t support geolocation.';
        }

        var options = {
            map: walkMeApp.map,
            position: {
                lat: 40.712784,
                lng: -74.005941
            },
            content: content
        };

        var infowindow = new google.maps.InfoWindow(options);
        walkMeApp.map.setCenter(options.position);
    }
});