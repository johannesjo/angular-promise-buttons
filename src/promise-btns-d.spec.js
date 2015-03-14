describe('promise-buttons directive', function ()
{
    'use strict';

    var scope,
        $timeout,
        $rootScope,
        $compile,
        fakeFact;

    beforeEach(module('angularPromiseButtons'));

    beforeEach(inject(function (_$rootScope_, _$compile_, _$timeout_, _$q_)
    {
        $rootScope = _$rootScope_;
        $compile = _$compile_;
        $timeout = _$timeout_;
        var $q = _$q_;

        scope = $rootScope.$new();

        fakeFact = {
            success: function ()
            {
                var defer = $q.defer();
                $timeout(function ()
                {
                    defer.resolve();
                });
                return defer.promise;
            },
            error: function ()
            {
                var defer = $q.defer();
                $timeout(function ()
                {
                    defer.reject();
                });
                return defer.promise;
            },
            endless: function ()
            {
                var defer = $q.defer();
                return defer.promise;
            }
        };
    }));

    describe('a simple success promise on click', function ()
    {
        var element;

        beforeEach(function ()
        {
            var html = '<button class="btn" ng-click="asyncCall()" promise-btn="promise">Success after delay</button>';
            element = $compile(html)(scope);
            scope.$digest();
            scope.asyncCall = function ()
            {
                scope.promise = fakeFact.success();
            };
        });

        it('should have a spinner appended', function ()
        {
            expect(angular.element(element.find('span')[1]).hasClass('btn-spinner'))
                .toBeTruthy();
        });

        it('has the is-spinning class appended on click', function ()
        {
            element.triggerHandler('click');
            scope.$digest();
            expect(element.hasClass('is-loading')).toBeTruthy();
        });

        it('is disabled on click', function ()
        {
            element.triggerHandler('click');
            scope.$digest();
            expect(element.attr('disabled')).toBe('disabled');
        });

        it('is not disabled after promise is resolved', function ()
        {
            element.triggerHandler('click');
            scope.$digest();
            expect(element.attr('disabled')).toBe('disabled');
            $timeout.flush();
            expect(element.attr('disabled')).not.toBe('disabled');
        });

        it('hasn\'t the is-spinning after promise is resolved', function ()
        {
            element.triggerHandler('click');
            scope.$digest();
            expect(element.hasClass('is-loading')).toBeTruthy();
            $timeout.flush();
            expect(element.hasClass('is-loading')).toBeFalsy();
        });

        it('should work the same with response errors', function ()
        {
            scope.asyncCall = function ()
            {
                scope.promise = fakeFact.error();
            };

            element.triggerHandler('click');
            scope.$digest();
            expect(element.hasClass('is-loading')).toBeTruthy();
            expect(element.attr('disabled')).toBe('disabled');
            $timeout.flush();
            expect(element.hasClass('is-loading')).toBeFalsy();
            expect(element.attr('disabled')).not.toBe('disabled');
        });

        it('should always be disabled and has class is loading for unresolvable requests', function ()
        {
            scope.asyncCall = function ()
            {
                scope.promise = fakeFact.endless();
            };

            element.triggerHandler('click');
            scope.$digest();
            expect(element.hasClass('is-loading')).toBeTruthy();
            expect(element.attr('disabled')).toBe('disabled');
            $timeout.flush();
            expect(element.hasClass('is-loading')).toBeTruthy();
            expect(element.attr('disabled')).toBe('disabled');
        });

        it('should be able to handle promise chains', function ()
        {
            scope.asyncCall = function ()
            {
                scope.v = {promiseIndex: 0};
                scope.promise = scope.countChain()
                    .then(scope.countChain)
                    .then(scope.countChain)
                    .then(scope.countChain)
                    .then(scope.countChain);
            };
            scope.countChain = function ()
            {
                return fakeFact.success().then(function ()
                {
                    $timeout.flush();
                    scope.v.promiseIndex++;
                    if (scope.v.promiseIndex < 5) {
                        expect(element.hasClass('is-loading')).toBeTruthy();
                    }
                });
            };

            expect(element.hasClass('is-loading')).toBeFalsy();
            element.triggerHandler('click');
            scope.$digest();
            expect(element.hasClass('is-loading')).toBeTruthy();

            // test test
            $timeout.flush();
            expect(scope.v.promiseIndex).toBe(5);
            expect(element.hasClass('is-loading')).toBeFalsy();
        });
    });
});
