app.controller("aboutController", function ($scope, $ionicModal) {

    $ionicModal.fromTemplateUrl('templates/disclaimer.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal;
    });

    $scope.openDisclaimer = function () {
        $scope.modal.show();
    };

    $scope.closeDisclaimer = function () {
        $scope.modal.hide();
    }
});