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
    });
});

walkMeApp.controller("formController", function ($scope) {
    $scope.codeAddress = function (element) {
        walkMeApp.geocoder.geocode({
            'address': element.value
        }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                walkMeApp.map.setCenter(results[0].geometry.location);
                var marker = new google.maps.Marker({
                    map: walkMeApp.map,
                    position: results[0].geometry.location
                });
                element.value = JSON.stringify({
                    lat: marker.position.lat(),
                    lng: marker.position.lng()
                });
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    }

    $scope.submitOnEnter = function (e) {
        // look for window.event in case event isn't passed in
        e = e || window.event;
        if (e.keyCode == 13) {
            var startInput = document.getElementsByName('startLocation')[0];
            var endInput = document.getElementsByName('endLocation')[0];
            $scope.codeAddress(startInput);
            $scope.codeAddress(endInput);

            var req = new XMLHttpRequest();
            var url = "http://104.236.249.124/api/";

            req.onreadystatechange = function () {
                if (req.readyState == 4 && req.status == 200) {
                    var res = JSON.parse(req.responseText);
                    console.log(res);
                }
            }
            req.open("GET", url + startInput.value + endInput.value, true);
            req.send();

            document.getElementById('searchForm').reset();
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