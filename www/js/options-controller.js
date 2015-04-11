app.controller('optionsController', function ($scope, uiGmapGoogleMapApi) {

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
            if ($scope.loaded)
                return;

            document.getElementById('minimap-canvas').style.height =
                (document.getElementById('view-container').clientHeight -
                    document.getElementById('routes-container').clientHeight) + 'px';

            $scope.map = new maps.Map(document.getElementById('minimap-canvas'), $scope.mapOptions);
            app.directionsDisplay = new maps.DirectionsRenderer();
            $scope.setAppRoute(0);
            $scope.loaded = true;
        });

    });

    $scope.setAppRoute = function (index) {
        app.directionsDisplay.setMap(null);
        app.directionsDisplay = new google.maps.DirectionsRenderer({
            map: $scope.map,
            directions: $scope.routeInfo.results,
            routeIndex: index,
            hideRouteList: true
        });
    }


});