angular.module('angularPromiseButtons')
    .directive('promiseBtn', ['angularPromiseButtons', function (angularPromiseButtons)
    {
        'use strict';

        return {
            restrict: 'EA',
            transclude: true,
            replace: true,
            scope: {
                promiseBtn: '='
            },
            templateUrl: 'promise-btn-d.html',
            link: function (scope, el)
            {
                var cfg = angularPromiseButtons.config;

                el.append(cfg.spinnerTpl);

                var loading = function ()
                    {
                        if (cfg.btnLoadingClass) {
                            el.addClass(cfg.btnLoadingClass);
                        }
                        if (cfg.disableBtn) {
                            el.attr('disabled', 'disabled');
                        }
                    },
                    loadingFinished = function ()
                    {
                        if (cfg.btnLoadingClass) {
                            el.removeClass(cfg.btnLoadingClass);
                        }
                        if (cfg.disableBtn) {
                            el.removeAttr('disabled');
                        }
                    };

                scope.$watch(function ()
                {
                    return scope.promiseBtn;
                }, function (mVal)
                {
                    if (mVal && mVal.then) {
                        loading();
                        mVal.finally(loadingFinished);
                    }
                });
            }
        };
    }]);
