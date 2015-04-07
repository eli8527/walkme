/* --------------------------------------------------------------------------
| Form Controller
|
| Parses form input and communicates with the server.
|-------------------------------------------------------------------------- */

app.controller("formController", function ($scope, $ionicLoading, $ionicPopover) {
    
    $scope.displayRoute = function (index) {
        app.directionsDisplay.setMap(null);
        app.directionsDisplay = new google.maps.DirectionsRenderer({
            map: app.map,
            directions: $scope.routeInfo.results,
            routeIndex: index
        });
    }

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
        app.directionsService.route(directionsRequest, function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                var req = new XMLHttpRequest();
                var url = "http://104.236.249.124/api/";

                // this block is executed upon server response
                req.onreadystatechange = function () {
                    if (req.readyState == 4 && req.status == 200) {
                        $ionicLoading.hide();
                        var res = JSON.parse(req.responseText);

                        // make info available to view
                        $scope.routeInfo = {
                            results: response,
                            indices: res.indicies
                        };

                        // initialize and show routes in popover
                        $ionicPopover.fromTemplateUrl('templates/popover.html', {
                            scope: $scope,
                        }).then(function (popover) {
                            $scope.popover = popover;
                            $scope.popover.show(document.getElementById('popover-source'));
                        });
                    }
                }

                var routejson = JSON.stringify(response.routes);
                req.open("POST", url, true);
                req.send(routejson);

                // display loading icon while waiting for response
                $ionicLoading.show();
            }
        });
    }

    $scope.submitOnEnter = function (e) {
        // look for window.event in case event isn't passed in
        e = e || window.event;

        if (e.keyCode == 13) {
            // make sure both input fields are populated
            if (app.startInput.value == '' || app.endInput.value == '')
                return;

            // array containing lat/lng of start and end addresses
            var addrLatLng = [];

            // geocode the start address
            app.geocoder.geocode({
                'address': app.startInput.value
            }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var pos = results[0].geometry.location;
                    addrLatLng.push(new google.maps.LatLng(pos.lat(), pos.lng()));
                    $scope.requestSafetyIndices(addrLatLng); // workaround for async call
                } else {
                    alert('Geocode was not successful for the following reason: ' + status);
                }
            });

            // geocode the end address
            app.geocoder.geocode({
                'address': app.endInput.value
            }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var pos = results[0].geometry.location;
                    addrLatLng.push(new google.maps.LatLng(pos.lat(), pos.lng()));
                    $scope.requestSafetyIndices(addrLatLng); // workaround for async call
                } else {
                    alert('Geocode was not successful for the following reason: ' + status);
                }
            });
        }
    }
})