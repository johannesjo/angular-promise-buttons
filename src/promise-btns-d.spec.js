describe('promise-buttons directive', function ()
{
    'use strict';

    var scope,
        $timeout,
        $rootScope,
        $httpBackend,
        $compile,
        fakeFact;

    beforeEach(module('angularPromiseButtons'));

    beforeEach(inject(function (_$rootScope_, _$compile_, _$timeout_, _$q_, _$http_, _$httpBackend_)
    {
        $rootScope = _$rootScope_;
        $compile = _$compile_;
        $timeout = _$timeout_;
        $httpBackend = _$httpBackend_;
        var $q = _$q_;
        var $http = _$http_;

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
            },
            httpSuccess: function ()
            {
                return $http.get('/mock');
            },
            httpError: function ()
            {
                return $http.get('/mockFail');
            }
        };
    }));

    afterEach(function ()
    {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('a simple promise on click', function ()
    {
        var element;

        beforeEach(function ()
        {
            var html = '<button ng-click="asyncCall()" promise-btn="promise">Success after delay</button>';
            element = $compile(html)(scope);
            scope.$digest();
            scope.asyncCall = function ()
            {
                scope.promise = fakeFact.success();
            };
        });

        it('should have a spinner appended', function ()
        {
            expect(angular.element(element.find('span')[0]).hasClass('btn-spinner'))
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

        it('should work with $resource promises', inject(function ($q)
        {
            var mockBagelApiService = {
                query: function ()
                {
                    var queryDeferred = $q.defer();
                    $timeout(function ()
                    {
                        queryDeferred.resolve();
                    });
                    return {$promise: queryDeferred.promise};
                }
            };
            scope.asyncCall = function ()
            {
                scope.promise = mockBagelApiService.query();
            };


            element.triggerHandler('click');
            scope.$digest();
            expect(element.hasClass('is-loading')).toBeTruthy();
            expect(element.attr('disabled')).toBe('disabled');
            $timeout.flush();
            expect(element.hasClass('is-loading')).toBeFalsy();
            expect(element.attr('disabled')).toBe(undefined);
        }));
    });

    describe('a $http promise on click', function ()
    {
        var element;

        beforeEach(function ()
        {
            var html = '<button ng-click="asyncCall()" promise-btn="promise">Success after delay</button>';
            element = $compile(html)(scope);
            scope.$digest();
        });


        it('should add and remove the is-loading class for $http promises', function ()
        {
            $httpBackend.expectGET('/mock').respond(200, 'validResponse');

            scope.asyncCall = function ()
            {
                scope.promise = fakeFact.httpSuccess()
                    .then(function (resp)
                    {
                        scope.test = resp.data;
                    });
            };
            element.triggerHandler('click');
            scope.$digest();
            expect(element.hasClass('is-loading')).toBeTruthy();
            $httpBackend.flush();
            expect(scope.test).toBe('validResponse');
            expect(element.hasClass('is-loading')).toBeFalsy();
        });


        it('should add and remove the is-loading class for $http promise chains', function ()
        {
            $httpBackend.expectGET('/mock').respond(200, 'validResponse');
            $httpBackend.expectGET('/mock').respond(200, 'validResponse');
            $httpBackend.expectGET('/mock').respond(200, 'validResponse');
            $httpBackend.expectGET('/mock').respond(200, 'validResponse');

            scope.chainRing = function ()
            {
                return fakeFact.httpSuccess();
            };
            scope.asyncCall = function ()
            {
                scope.promise = fakeFact.httpSuccess()
                    .then(scope.chainRing)
                    .then(scope.chainRing)
                    .then(scope.chainRing);
            };
            element.triggerHandler('click');
            scope.$digest();
            expect(element.hasClass('is-loading')).toBeTruthy();
            $httpBackend.flush();
            expect(element.hasClass('is-loading')).toBeFalsy();
        });

        it('finally an catch functions should still exectue', function ()
        {
            var catchCalled = false,
                finallyCalled = false;
            $httpBackend.expectGET('/mockFail').respond(400, 'validResponse');

            scope.chainRing = function ()
            {
                return fakeFact.httpError();
            };
            scope.asyncCall = function ()
            {
                scope.promise = scope.chainRing()
                    .then(scope.chainRing)
                    .catch(function ()
                    {
                        catchCalled = true;
                    })
                    .finally(function ()
                    {
                        finallyCalled = true;
                    });
            };
            element.triggerHandler('click');
            scope.$digest();
            expect(element.hasClass('is-loading')).toBeTruthy();
            $httpBackend.flush();
            expect(catchCalled).toBeTruthy();
            expect(finallyCalled).toBeTruthy();
            expect(element.hasClass('is-loading')).toBeFalsy();
        });
    });


    describe('a promise directly returned on click', function ()
    {
        var element;

        beforeEach(function ()
        {
            var html = '<button ng-click="asyncCall()" promise-btn>Success after delay</button>';
            element = $compile(html)(scope);
            scope.$digest();
            scope.asyncCall = function ()
            {
                return fakeFact.success();
            };
        });

        it('should have a spinner appended', function ()
        {
            expect(angular.element(element.find('span')[0]).hasClass('btn-spinner'))
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
                return fakeFact.error();
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
                return fakeFact.endless();
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
                return scope.countChain()
                    .then(scope.countChain)
                    .then(scope.countChain)
                    .then(scope.countChain)
                    .then(scope.countChain);
            };
            scope.countChain = function ()
            {
                return fakeFact.success().then(function ()
                {
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

        it('should work with $resource promises', inject(function ($q)
        {
            var mockBagelApiService = {
                query: function ()
                {
                    var queryDeferred = $q.defer();
                    return {$promise: queryDeferred.promise};
                }
            };
            scope.asyncCall = function ()
            {
                return mockBagelApiService.query();
            };


            element.triggerHandler('click');
            scope.$digest();
            expect(element.hasClass('is-loading')).toBeTruthy();
            expect(element.attr('disabled')).toBe('disabled');
            $timeout.flush();
            expect(element.hasClass('is-loading')).toBeTruthy();
            expect(element.attr('disabled')).toBe('disabled');
        }));
    });


    describe('a promise directly returned by form ngSubmit function', function ()
    {
        var btnEl;
        var formEl;

        beforeEach(function ()
        {
            var html = '<form ng-submit="asyncCall()" promise-btn>' +
                '<button type="submit">Success after delay</button>' +
                '</form>';

            formEl = $compile(html)(scope);
            btnEl = formEl.children()[0];
            btnEl = angular.element(btnEl);

            scope.$digest();
            scope.asyncCall = function ()
            {
                return fakeFact.success();
            };
        });

        it('should have a spinner appended', function ()
        {
            expect(angular.element(btnEl.find('span')[0]).hasClass('btn-spinner'))
                .toBeTruthy();
        });

        it('has the is-spinning class appended on click', function ()
        {
            formEl.triggerHandler('submit');
            scope.$digest();
            expect(btnEl.hasClass('is-loading')).toBeTruthy();
        });

        it('is disabled on click', function ()
        {
            formEl.triggerHandler('submit');
            scope.$digest();
            expect(btnEl.attr('disabled')).toBe('disabled');
        });

        it('is not disabled after promise is resolved', function ()
        {
            formEl.triggerHandler('submit');
            scope.$digest();
            expect(btnEl.attr('disabled')).toBe('disabled');
            $timeout.flush();
            expect(btnEl.attr('disabled')).not.toBe('disabled');
        });

        it('hasn\'t the is-spinning after promise is resolved', function ()
        {
            formEl.triggerHandler('submit');
            scope.$digest();
            expect(btnEl.hasClass('is-loading')).toBeTruthy();
            $timeout.flush();
            expect(btnEl.hasClass('is-loading')).toBeFalsy();
        });

        it('should work the same with response errors', function ()
        {
            scope.asyncCall = function ()
            {
                return fakeFact.error();
            };

            formEl.triggerHandler('submit');
            scope.$digest();
            expect(btnEl.hasClass('is-loading')).toBeTruthy();
            expect(btnEl.attr('disabled')).toBe('disabled');
            $timeout.flush();
            expect(btnEl.hasClass('is-loading')).toBeFalsy();
            expect(btnEl.attr('disabled')).not.toBe('disabled');
        });

        it('should always be disabled and has class is loading for unresolvable requests', function ()
        {
            scope.asyncCall = function ()
            {
                return fakeFact.endless();
            };

            formEl.triggerHandler('submit');
            scope.$digest();
            expect(btnEl.hasClass('is-loading')).toBeTruthy();
            expect(btnEl.attr('disabled')).toBe('disabled');
            $timeout.flush();
            expect(btnEl.hasClass('is-loading')).toBeTruthy();
            expect(btnEl.attr('disabled')).toBe('disabled');
        });

        it('should be able to handle promise chains', function ()
        {
            scope.asyncCall = function ()
            {
                scope.v = {promiseIndex: 0};
                return scope.countChain()
                    .then(scope.countChain)
                    .then(scope.countChain)
                    .then(scope.countChain)
                    .then(scope.countChain);
            };
            scope.countChain = function ()
            {
                return fakeFact.success().then(function ()
                {
                    scope.v.promiseIndex++;
                    if (scope.v.promiseIndex < 5) {
                        expect(btnEl.hasClass('is-loading')).toBeTruthy();
                    }
                });
            };

            expect(btnEl.hasClass('is-loading')).toBeFalsy();
            formEl.triggerHandler('submit');
            scope.$digest();
            expect(btnEl.hasClass('is-loading')).toBeTruthy();

            // test test
            $timeout.flush();
            expect(scope.v.promiseIndex).toBe(5);
            expect(btnEl.hasClass('is-loading')).toBeFalsy();
        });

        it('should work with $resource promises', inject(function ($q)
        {
            var mockBagelApiService = {
                query: function ()
                {
                    var queryDeferred = $q.defer();
                    return {$promise: queryDeferred.promise};
                }
            };
            scope.asyncCall = function ()
            {
                return mockBagelApiService.query();
            };


            formEl.triggerHandler('submit');
            scope.$digest();
            expect(btnEl.hasClass('is-loading')).toBeTruthy();
            expect(btnEl.attr('disabled')).toBe('disabled');
            $timeout.flush();
            expect(btnEl.hasClass('is-loading')).toBeTruthy();
            expect(btnEl.attr('disabled')).toBe('disabled');
        }));
    });
});
