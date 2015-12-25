angular.module('angularPromiseButtons')
    .directive('promiseBtn', ['angularPromiseButtons', '$parse', function (angularPromiseButtons, $parse)
    {
        'use strict';

        var CLICK_EVENT = 'click';
        var CLICK_ATTR = 'ngClick';
        var SUBMIT_EVENT = 'submit';
        var SUBMIT_ATTR = 'ngSubmit';

        return {
            restrict: 'EA',
            scope: {
                promiseBtn: '=',
                promiseBtnOptions: '=?'
            },
            link: function (scope, el, attrs)
            {
                var providerCfg = angularPromiseButtons.config;
                var cfg = providerCfg;
                var promiseWatcher;


                function handleLoading()
                {
                    if (cfg.btnLoadingClass && !cfg.addClassToCurrentBtnOnly) {
                        el.addClass(cfg.btnLoadingClass);
                    }
                    if (cfg.disableBtn && !cfg.disableCurrentBtnOnly) {
                        el.attr('disabled', 'disabled');
                    }
                }

                function handleLoadingFinished()
                {
                    if (cfg.btnLoadingClass) {
                        el.removeClass(cfg.btnLoadingClass);
                    }
                    if (cfg.disableBtn) {
                        el.removeAttr('disabled');
                    }
                }

                function initPromiseWatcher(watchExpressionForPromise)
                {
                    // watch promise to resolve or fail
                    scope.$watch(watchExpressionForPromise, function (mVal)
                    {
                        // for regular promises
                        if (mVal && mVal.then) {
                            handleLoading();
                            mVal.finally(handleLoadingFinished);
                        }
                        // for $resource
                        else if (mVal && mVal.$promise) {
                            handleLoading();
                            mVal.$promise.finally(handleLoadingFinished);
                        }
                    });
                }


                function getCallbacks(expression)
                {
                    return expression
                        .split(';')
                        .map(function (callback)
                        {
                            return $parse(callback);
                        });
                }

                // INIT
                el.append(cfg.spinnerTpl);

                // handle current button only options via click
                if (cfg.addClassToCurrentBtnOnly) {
                    el.on(CLICK_EVENT, function ()
                    {
                        el.addClass(cfg.btnLoadingClass);
                    });
                }

                if (cfg.disableCurrentBtnOnly) {
                    el.on(CLICK_EVENT, function ()
                    {
                        el.attr('disabled', 'disabled');
                    });
                }

                // check if there is any value given via attrs.promiseBtn
                if (!attrs.promiseBtn) {

                    // handle ngClick function directly returning a promise
                    if (attrs.hasOwnProperty(CLICK_ATTR)) {

                        // we need to use evalAsync here, as
                        // otherwise the click event won't be ready to be replaced
                        scope.$evalAsync(function ()
                        {
                            var callbacks = getCallbacks(attrs[CLICK_ATTR]);

                            // unbind original click event
                            el.unbind(CLICK_EVENT);

                            // rebind, but this time watching it's return value
                            el.bind(CLICK_EVENT, function ()
                            {
                                // Make sure we run the $digest cycle
                                scope.$apply(function ()
                                {
                                    callbacks.forEach(function (cb)
                                    {
                                        // execute function on parent scope
                                        // as we're in an isolate scope here
                                        var promise = cb(scope.$parent, {$event: CLICK_EVENT});

                                        // only init watcher if not done before
                                        if (!promiseWatcher) {
                                            promiseWatcher = initPromiseWatcher(function ()
                                            {
                                                return promise;
                                            });
                                        }
                                    });
                                });
                            });
                        });
                    } else if (attrs.hasOwnProperty(SUBMIT_ATTR)) {
                        // TODO handle submit
                    }
                } else {
                    // handle promise passed directly via attribute as variable
                    initPromiseWatcher(function ()
                    {
                        return scope.promiseBtn;
                    });
                }


                // watch and update options being changed
                scope.$watch('promiseBtnOptions', function (newVal)
                {
                    if (angular.isObject(newVal)) {
                        cfg = angular.extend({}, providerCfg, newVal);
                    }
                }, true);
            }
        };
    }]);
