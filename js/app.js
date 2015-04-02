var walkMeApp = angular.module('walkMeApp', ['uiGmapgoogle-maps']);

walkMeApp.config(function (uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyBt1EnZ9lAjCx6nOu4iqUtFQ9sKnjOvGCE',
        v: '3.17',
        libraries: 'visualization'
    });
})