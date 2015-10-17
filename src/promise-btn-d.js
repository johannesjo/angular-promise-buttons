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

                var loading = function ()
                {
                    if (cfg.btnLoadingClass && !cfg.addClassToCurrentBtnOnly) {
                        el.addClass(cfg.btnLoadingClass);
                    }
                    if (cfg.disableBtn && !cfg.disableCurrentBtnOnly) {
                        el.attr('disabled', 'disabled');
                    }
                };

                var loadingFinished = function ()
                {
                    if (cfg.btnLoadingClass) {
                        el.removeClass(cfg.btnLoadingClass);
                    }
                    if (cfg.disableBtn) {
                        el.removeAttr('disabled');
                    }
                };


                // init
                el.append(cfg.spinnerTpl);

                // handle current button only options via click
                if (cfg.addClassToCurrentBtnOnly) {
                    el.on('click', function ()
                    {
                        el.addClass(cfg.btnLoadingClass);
                    });
                }

                if (cfg.disableCurrentBtnOnly) {
                    el.on('click', function ()
                    {
                        el.attr('disabled', 'disabled');
                    });
                }


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
