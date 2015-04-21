var app = angular.module('walkMeApp', ['uiGmapgoogle-maps', 'ionic', 'ui.router']);

app.config(function (uiGmapGoogleMapApiProvider, $stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('home', {
            name: 'home',
            url: '/',
            templateUrl: 'templates/home.html',
            controller: 'homeController'
        })
        .state('options', {
            name: 'options',
            url: '/options',
            templateUrl: 'templates/options.html',
            controller: 'optionsController'
        })
        .state('route', {
            name: 'route',
            url: '/route',
            templateUrl: 'templates/route.html',
            controller: 'routeController'
        })
        .state('about', {
            name: 'about',
            url: '/about',
            templateUrl: 'templates/about.html',
            controller: 'aboutController'
        });

    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyBt1EnZ9lAjCx6nOu4iqUtFQ9sKnjOvGCE',
        v: '3.17',
        libraries: 'geometry, visualization'
    });
});
