var app = angular.module('walkMeApp', ['uiGmapgoogle-maps', 'ionic', 'ui.router']);

app.config(function (uiGmapGoogleMapApiProvider, $stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider.state('home', {
        url: '/',
        views: {
            home: {
                templateUrl: 'templates/home.html',
                controller: 'homeController'
            }
        }
    })
    .state('route', {
        url: '/route',
        views: {
            route: {
                templateUrl: 'templates/route.html',
                controller: 'routeController'
            }
        }
    });

    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyBt1EnZ9lAjCx6nOu4iqUtFQ9sKnjOvGCE',
        v: '3.17',
        libraries: 'geometry, visualization'
    });
})