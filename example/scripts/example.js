angular.module('exampleApp', [
    'angularPromiseButtons',
    'ngAnimate'
])
    .factory('fakeFac', function ($q, $timeout, $log)
    {
        var standardDelay = 3000;
        return {
            success: function ()
            {
                var defer = $q.defer();
                $timeout(function ()
                {
                    $log.info('resolve');
                    defer.resolve({
                        msg: 'SUCCESS'
                    })
                }, standardDelay);
                return defer.promise;
            },
            error: function ()
            {
                var defer = $q.defer();
                $timeout(function ()
                {
                    $log.info('error');
                    defer.reject({
                        msg: 'ERROR'
                    })
                }, standardDelay);
                return defer.promise;
            },
            endless: function ()
            {
                var defer = $q.defer();
                return defer.promise;
            }
        };
    })
    .controller('exampleCtrl', function ($scope, fakeFac)
    {
        $scope.success = function ()
        {
            $scope.successPromise = fakeFac.success();
        };

        $scope.error = function ()
        {
            $scope.errorPromise = fakeFac.error();
        };

        $scope.endlesse = function ()
        {
            $scope.endlessePromise = fakeFac.endlesse();
        };

        $scope.auto = function ()
        {
            $scope.autoPromise = fakeFac.endless();
        };
        $scope.auto();
    });
