angular.module('exampleApp', [
    'angularPromiseButtons',
    'ngAnimate'
])
    .controller('exampleCtrl', function ($scope)
    {
        $scope.submit = function ()
        {
            alert('Form submitted');
        };
    });
