describe('promise-buttons directive with config', function ()
{
    'use strict';

    var provider;

    beforeEach(module('angularPromiseButtons', function (angularPromiseButtonsProvider)
    {
        provider = angularPromiseButtonsProvider;
    }));

    var scope,
        $timeout,
        $rootScope,
        $compile,
        fakeFact,
        html;


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
            html = '<button class="btn" ng-click="asyncCall()" promise-btn="promise">Success after delay</button>';
            scope.asyncCall = function ()
            {
                scope.promise = fakeFact.success();
            };
        });

        it('should have a customizable spinner-tpl', function ()
        {
            provider.extendConfig({
                spinnerTpl: '<span class="CLASS-SPANNER"></span>'
            });
            element = $compile(html)(scope);
            scope.$digest();

            expect(angular.element(element.find('span')[0]).hasClass('btn-spinner'))
                .toBeFalsy();
            expect(angular.element(element.find('span')[0]).hasClass('CLASS-SPANNER'))
                .toBeTruthy();

        });

        it('disabling the buttons can be deactivated', function ()
        {
            provider.extendConfig({
                disableBtn: false
            });
            element = $compile(html)(scope);
            scope.$digest();

            scope.asyncCall = function ()
            {
                scope.promise = fakeFact.error();
            };

            element.triggerHandler('click');
            scope.$digest();
            expect(element.hasClass('is-loading')).toBeTruthy();
            expect(element.attr('disabled')).toBeUndefined();
        });

        it('is-loading class can be deactivated', function ()
        {
            provider.extendConfig({
                btnLoadingClass: false
            });
            element = $compile(html)(scope);
            scope.$digest();

            scope.asyncCall = function ()
            {
                scope.promise = fakeFact.error();
            };

            element.triggerHandler('click');
            scope.$digest();
            expect(element.hasClass('is-loading')).toBeFalsy();
            expect(element.attr('disabled')).toBe('disabled');
        });

        it('has a settable loading class', function ()
        {
            var customClass = 'CUSTOM';
            provider.extendConfig({
                btnLoadingClass: customClass
            });
            element = $compile(html)(scope);
            scope.$digest();

            scope.asyncCall = function ()
            {
                scope.promise = fakeFact.error();
            };

            element.triggerHandler('click');
            scope.$digest();
            expect(element.hasClass('CUSTOM')).toBeTruthy();
        });

        it('should add class and disabled to multiple buttons with the same promise', function ()
        {
            provider.extendConfig({
                addClassToCurrentBtnOnly: false,
                disableCurrentBtnOnly: false
            });
            var element1 = $compile(html)(scope);
            var element2 = $compile(html)(scope);
            scope.$digest();

            scope.asyncCall = function ()
            {
                scope.promise = fakeFact.error();
            };

            element1.triggerHandler('click');
            scope.$digest();

            expect(element1.hasClass('is-loading')).toBe(true);
            expect(element1.attr('disabled')).toBe('disabled');

            expect(element2.hasClass('is-loading')).toBe(true);
            expect(element2.attr('disabled')).toBe('disabled');
        });


        it('should add class to currently clicked button only when option is specified', function ()
        {
            provider.extendConfig({
                addClassToCurrentBtnOnly: true
            });
            var element1 = $compile(html)(scope);
            var element2 = $compile(html)(scope);
            scope.$digest();

            scope.asyncCall = function ()
            {
                scope.promise = fakeFact.error();
            };

            element1.triggerHandler('click');
            scope.$digest();

            expect(element1.hasClass('is-loading')).toBe(true);
            expect(element1.attr('disabled')).toBe('disabled');

            expect(element2.hasClass('is-loading')).toBe(false);
            expect(element2.attr('disabled')).toBe('disabled');
        });


        it('should add disabled attribute to currently clicked button only when option is specified', function ()
        {
            provider.extendConfig({
                disableCurrentBtnOnly: true
            });
            var element1 = $compile(html)(scope);
            var element2 = $compile(html)(scope);
            scope.$digest();

            scope.asyncCall = function ()
            {
                scope.promise = fakeFact.error();
            };

            element1.triggerHandler('click');
            scope.$digest();

            expect(element1.hasClass('is-loading')).toBe(true);
            expect(element1.attr('disabled')).toBe('disabled');

            expect(element2.hasClass('is-loading')).toBe(true);
            expect(element2.attr('disabled')).toBe(undefined);
        });
    });


    describe('with attribute options', function ()
    {
        var htmlWithCfg;
        var htmlWithoutCfg;

        beforeEach(function ()
        {
            htmlWithCfg = '<button class="btn" promise-btn-options="options" ng-click="asyncCall()" promise-btn="promise">Success after delay</button>';
            htmlWithoutCfg = '<button class="btn" ng-click="asyncCall()" promise-btn="promise">Success after delay</button>';
            scope.asyncCall = function ()
            {
                scope.promise = fakeFact.success();
            };
        });


        it('should add class to currently clicked button only when option is specified', function ()
        {
            provider.extendConfig({
                disableBtn: false,
                btnLoadingClass: false
            });
            scope.options = {
                disableBtn: true,
                btnLoadingClass: 'is-loading'
            };

            var elWithCfg = $compile(htmlWithCfg)(scope);
            var elWithoutCfg = $compile(htmlWithoutCfg)(scope);
            scope.$digest();

            scope.asyncCall = function ()
            {
                scope.promise = fakeFact.error();
            };

            elWithCfg.triggerHandler('click');
            scope.$digest();

            expect(elWithCfg.hasClass('is-loading')).toBe(true);
            expect(elWithCfg.attr('disabled')).toBe('disabled');

            expect(elWithoutCfg.hasClass('is-loading')).toBe(false);
            expect(elWithoutCfg.attr('disabled')).toBe(undefined);
        });


        it('should add disabled attribute to currently clicked button only when option is specified', function ()
        {
            provider.extendConfig({
                disableBtn: true,
                btnLoadingClass: 'is-loading'
            });
            scope.options = {
                disableBtn: false,
                btnLoadingClass: false
            };

            var elWithCfg = $compile(htmlWithCfg)(scope);
            var elWithoutCfg = $compile(htmlWithoutCfg)(scope);
            scope.$digest();

            scope.asyncCall = function ()
            {
                scope.promise = fakeFact.error();
            };

            elWithCfg.triggerHandler('click');
            scope.$digest();

            expect(elWithCfg.hasClass('is-loading')).toBe(false);
            expect(elWithCfg.attr('disabled')).toBe(undefined);
            //
            expect(elWithoutCfg.hasClass('is-loading')).toBe(true);
            expect(elWithoutCfg.attr('disabled')).toBe('disabled');
        });
    });
});
