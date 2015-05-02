app.controller('optionsController', function ($scope, uiGmapGoogleMapApi, $ionicPopup) {

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
            var mapHeight = document.getElementById('options-view-container').clientHeight - document.getElementById('options-container').clientHeight;
            if (mapHeight < 200) mapHeight = 200;
            document.getElementById('minimap-canvas').style.height = mapHeight + 'px';

            $scope.map = new maps.Map(document.getElementById('minimap-canvas'), $scope.mapOptions);
            app.directionsDisplay = new maps.DirectionsRenderer();
            $scope.setActiveRoute(0);
            $scope.loaded = true;
        });

    });

    // Requests an uber
    $scope.getUber = function () {
        console.log("uber");
        window.open('uber://?action=setPickup&pickup=my_location', 'system');
    };

    // Should we show the uber button?
    $scope.shouldShow = function () {

        // is it ios?
        var ios = navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false;
        if (!ios) {
            return false;
        }

        // get lowest safety index
        var min = Number.POSITIVE_INFINITY;
        var routes = $scope.routeInfo.routes;

        for (i = 0; i < routes.length; i++) {
            if (routes[i].safetyIndex < min) {
                min = routes[i].safetyIndex;
            }
        }

        return (min < 5);
    };

    // Make a popup that shows additional safety details
    $scope.showSafetyInfo = function (index) {
        $scope.setActiveRoute(index);
        var popup = $ionicPopup.show({
            title: 'Route Details',
            subTitle: '% difference from NYC average',
            templateUrl: 'templates/safety-info.html',
            scope: $scope,
            buttons: [{
                text: 'OK',
                type: 'button-dark',
            }]
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

    // Get color to render for safety index
    $scope.indexToColor = function (index) {
        if (index < 0) return colors[0];
        if (index <= 3) return colors[1];
        if (index <= 3.5) return colors[2];
        if (index <= 4) return colors[3];
        if (index <= 5) return colors[4];
        if (index <= 6) return colors[5];
        if (index <= 7) return colors[6];
        if (index <= 8) return colors[7];
        if (index <= 9) return colors[8];
        if (index <= 10) return colors[9];

        console.log("Invalid safety index");
        return undefined;
    };

    // Convert safety index to display text
    $scope.indexToText = function (index) {
        if (index < 0) return "-";
        else return (Math.round(index * 10) / 10).toFixed(1);
    }

    // Get color to render for percentage
    $scope.pctToColor = function (pct) {
        if (pct === -999 || pct == 0) return colors[0];
        if (pct < -30) return colors[9];
        if (pct < -20) return colors[8];
        if (pct < -10) return colors[7];
        if (pct < 0) return colors[6];
        if (pct < 10) return colors[5];
        if (pct < 20) return colors[4];
        if (pct < 30) return colors[3];
        if (pct < 40) return colors[2];
        return colors[1];
    }

    // Convert percentage to display text
    $scope.pctToText = function (pct) {
        if (pct === -999) return 'No data'
        if (pct <= 0) return Math.round(pct) + '%';
        if (pct > 0) return '+' + Math.round(pct) + '%';
    }

    // Set the highlighted route to the route at index
    $scope.setActiveRoute = function (index) {
        $scope.active = $scope.routeInfo.routes[index];

        app.directionsDisplay.setMap(null);
        app.directionsDisplay = new google.maps.DirectionsRenderer({
            map: $scope.map,
            directions: $scope.routeInfo,
            routeIndex: index,
            hideRouteList: true
        });
    };

    // Is the route at index active?
    $scope.isActiveRoute = function (index) {
        return $scope.active === $scope.routeInfo.routes[index];
    };
});