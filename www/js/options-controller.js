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
            if ($scope.loaded) {
                return;
            }

            var mapHeight = document.getElementById('view-container').clientHeight - document.getElementById('routes-container').clientHeight;
            if (mapHeight < 200) mapHeight = 200;
            document.getElementById('minimap-canvas').style.height = mapHeight + 'px';

            $scope.map = new maps.Map(document.getElementById('minimap-canvas'), $scope.mapOptions);
            app.directionsDisplay = new maps.DirectionsRenderer();
            $scope.setAppRoute(0);
            $scope.loaded = true;
        });

    });

    $scope.showSafetyInfo = function () {
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

    $scope.indexToColor = function (index) {
        if (index < 0) {
            console.log("Invalid safety index");
            return undefined;
        } else if (index === '-') return "#888888";
        else if (index <= 3) return "#f20000";
        else if (index <= 4) return "#ea3d00";
        else if (index <= 5) return "#ea5f00";
        else if (index <= 6) return "#ee8e00";
        else if (index <= 6.5) return "#deb400";
        else if (index <= 7) return "#e2dd00";
        else if (index <= 7.5) return "#b7e200";
        else if (index <= 8) return "#8bea00";
        else if (index <= 8.5) return "#58da00";
        else if (index <= 9) return "#38d600";
        else if (index <= 10) return "#00d200";
        else {
            console.log("Invalid safety index");
            return undefined;
        }
    };

    $scope.setAppRoute = function (index) {
        $scope.active = $scope.routeInfo.routes[index];

        app.directionsDisplay.setMap(null);
        app.directionsDisplay = new google.maps.DirectionsRenderer({
            map: $scope.map,
            directions: $scope.routeInfo,
            routeIndex: index,
            hideRouteList: true
        });
    };

    $scope.isActiveRoute = function (index) {
        return $scope.active === $scope.routeInfo.routes[index];
    };

    $scope.getUber = function () {
        console.log("uber");
        window.open('uber://?action=setPickup&pickup=my_location', 'system');
    };

    $scope.shouldShow = function () {

        // is it ios?
        var ios = navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false;
        if (!ios) {
            return false;
        }

        // get lowest safety index
        return true;
    };
});