var app = angular.module('walkMeApp', ['uiGmapgoogle-maps', 'ionic', 'ui.router']);

app.config(function (uiGmapGoogleMapApiProvider, $stateProvider, $urlRouterProvider) {
//    $urlRouterProvider.otherwise('/');
//
//    $stateProvider.state('home', {
//        url: '/',
//        views: {
//            home: {
//                templateUrl: 'home.html'
//            }
//        }
//    })
//
//    .state('routes', {
//        url: '/routes',
//        views: {
//            routes: {
//                templateUrl: 'routes.html'
//            }
//        }
//    });

    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyBt1EnZ9lAjCx6nOu4iqUtFQ9sKnjOvGCE',
        v: '3.17',
        libraries: 'geometry, visualization'
    });
})