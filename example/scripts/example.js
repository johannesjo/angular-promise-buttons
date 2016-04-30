angular.module('exampleApp', [
    'ngAnimate',
    'angularPromiseButtons'
])
    .factory('fakeFac', function ($q, $timeout, $log)
    {
        var standardDelay = 1000;
        return {
            success: function ()
            {
                var defer = $q.defer();
                $timeout(function ()
                {
                    $log.info('resolve');
                    defer.resolve({
                        msg: 'SUCCESS'
                    });
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
                    });
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
        $scope.v = {
            promiseIndex: 0
        };
        $scope.success = function ($event)
        {
            console.log($event);
            $scope.successPromise = false;
            $scope.successPromise = fakeFac.success();
            return $scope.successPromise;
        };

        $scope.successDirectlyReturnedPromise = function ()
        {
            return fakeFac.success();
        };

        $scope.error = function ()
        {
            $scope.errorPromise = fakeFac.error();
        };

        $scope.endless = function ()
        {
            $scope.endlessPromise = fakeFac.endless();
        };

        $scope.auto = function ()
        {
            $scope.autoPromise = fakeFac.endless();
        };

        $scope.submit = function ()
        {
            $scope.submitPromise = fakeFac.success();
        };
        $scope.submitDirectlyReturnPromise = function ()
        {
            return fakeFac.success();
        };
        $scope.chain = function ()
        {
            $scope.v.promiseIndex = 0;
            $scope.chainedPromises = $scope.countChain()
                .then($scope.countChain)
                .then($scope.countChain)
                .then($scope.countChain)
                .then($scope.countChain);

            return $scope.chainedPromises;
        };
        $scope.countChain = function ()
        {
            return fakeFac.success().then(function ()
            {
                $scope.v.promiseIndex++;
            });
        };

        $scope.auto();
    });
