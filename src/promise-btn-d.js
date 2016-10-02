angular.module('angularPromiseButtons')
    .directive('promiseBtn', ['angularPromiseButtons', '$compile', '$parse', '$timeout', function(angularPromiseButtons, $compile, $parse, $timeout) {
        'use strict';

        var CLICK_EVENT = 'click';
        var CLICK_ATTR = 'ngClick';
        var SUBMIT_EVENT = 'submit';
        var SUBMIT_ATTR = 'ngSubmit';

        return {
            restrict: 'EA',
            priority: angularPromiseButtons.config.priority,
            scope: {
                promiseBtn: '=',
                promiseBtnOptions: '=?'
            },
            link: function(scope, el, attrs) {
                var providerCfg = angularPromiseButtons.config;
                var cfg = providerCfg;
                var promiseWatcher;
                var minDurationTimeout;
                var timeoutDone;
                var promiseDone;
                var revertTimeout;


                function setLoadingState(btnEl) {
                    if (cfg.btnLoadingClass && !cfg.addClassToCurrentBtnOnly) {
                        btnEl.addClass(cfg.btnLoadingClass);
                    }
                    if (cfg.disableBtn && !cfg.disableCurrentBtnOnly) {
                        btnEl.attr('disabled', 'disabled');
                    }
                    if (cfg.btnLoadingHtml) {
                        btnEl.html(cfg.btnLoadingHtml);
                        appendSpinnerTpl(btnEl);
                    }
                }

                function handleLoadingFinished(btnEl, defaultHtml, loadingFinishedConfig) {
                    removeLoadingState(btnEl);
                    var waitTime = 0;

                    //OnSuccess or OnError
                    if (loadingFinishedConfig.handlerFunction && angular.isFunction(loadingFinishedConfig.handlerFunction)) {
                        loadingFinishedConfig.handlerFunction();
                    }


                    if (loadingFinishedConfig && loadingFinishedConfig.resultWaitTime && loadingFinishedConfig.resultWaitTime >= 0) {
                        waitTime = loadingFinishedConfig.resultWaitTime;
                    }

                    if (waitTime) {
                        setFinishedState(btnEl, loadingFinishedConfig);
                    }

                    // revert button to default state
                    revertTimeout = $timeout(function() {
                        revertToNormalState(btnEl, defaultHtml, loadingFinishedConfig);
                    }, waitTime);

                    return revertTimeout;
                }

                function setFinishedState(btnEl, loadingFinishedConfig) {
                    if (loadingFinishedConfig) {
                        if (loadingFinishedConfig.resultHtml) {
                            btnEl.html(loadingFinishedConfig.resultHtml);
                        }
                        if (loadingFinishedConfig.resultCssClass) {
                            btnEl.addClass(loadingFinishedConfig.resultCssClass);
                        }
                    }
                }

                function removeLoadingState(btnEl) {
                    if (cfg.btnLoadingClass) {
                        btnEl.removeClass(cfg.btnLoadingClass);
                    }
                }

                function revertToNormalState(btnEl, defaultHtml, loadingFinishedConfig) {
                    if (cfg.disableBtn) {
                        btnEl.removeAttr('disabled');
                    }
                    if (defaultHtml && btnEl.html() != defaultHtml) {
                        btnEl.html(defaultHtml);
                    }
                    if (loadingFinishedConfig && loadingFinishedConfig.resultCssClass) {
                        btnEl.removeClass(loadingFinishedConfig.resultCssClass);
                    }
                }

                function initPromiseWatcher(watchExpressionForPromise, btnEl) {
                    // watch promise to resolve or fail
                    scope.$watch(watchExpressionForPromise, function(mVal) {
                        var promise;
                        timeoutDone = false;
                        promiseDone = false;

                        // create timeout if option is set
                        if (cfg.minDuration) {
                            minDurationTimeout = $timeout(function() {
                                timeoutDone = true;
                                handleLoadingFinished(btnEl);
                            }, cfg.minDuration);
                        }

                        // for regular promises
                        if (mVal && mVal.then) {
                            promise = mVal;
                        }
                        // for $resource
                        else if (mVal && mVal.$promise) {
                            promise = mVal.$promise;
                        }

                        if (promise) {
                            var defaultHtml = cfg.defaultHtml || btnEl.html();
                            setLoadingState(btnEl);
                            promise.then(
                                function() {
                                    promiseDone = true;
                                    handleLoadingFinished(btnEl, defaultHtml, cfg.onSuccessConfig);
                                },
                                function() {
                                    promiseDone = true;
                                    handleLoadingFinished(btnEl, defaultHtml, cfg.onErrorConfig);
                                });
                        }
                    });
                }

                function getCallbacks(expression) {
                    return expression
                    // split by ; to get different functions if any
                        .split(';')
                        .map(function(callback) {
                            // return getter function
                            return $parse(callback);
                        });
                }

                function appendSpinnerTpl(btnEl) {
                    btnEl.append(cfg.spinnerTpl);
                }

                function addHandlersForCurrentBtnOnly(btnEl) {
                    // handle current button only options via click
                    if (cfg.addClassToCurrentBtnOnly) {
                        btnEl.on(CLICK_EVENT, function() {
                            btnEl.addClass(cfg.btnLoadingClass);
                        });
                    }

                    if (cfg.disableCurrentBtnOnly) {
                        btnEl.on(CLICK_EVENT, function() {
                            btnEl.attr('disabled', 'disabled');
                        });
                    }
                }

                function initHandlingOfViewFunctionsReturningAPromise(eventToHandle, attrToParse, btnEl) {
                    // we need to use evalAsync here, as
                    // otherwise the click or submit event
                    // won't be ready to be replaced
                    scope.$evalAsync(function() {
                        var callbacks = getCallbacks(attrs[attrToParse]);

                        // unbind original click event
                        el.unbind(eventToHandle);

                        // rebind, but this time watching it's return value
                        el.bind(eventToHandle, function() {
                            // Make sure we run the $digest cycle
                            scope.$apply(function() {
                                callbacks.forEach(function(cb) {
                                    // execute function on parent scope
                                    // as we're in an isolate scope here
                                    var promise = cb(scope.$parent, {$event: eventToHandle});

                                    // only init watcher if not done before
                                    if (!promiseWatcher) {
                                        promiseWatcher = initPromiseWatcher(function() {
                                            return promise;
                                        }, btnEl);
                                    }
                                });
                            });
                        });
                    });
                }

                function getSubmitBtnChildren(el) {
                    var submitBtnEls = [];
                    var allButtonEls = el.find('button');

                    for (var i = 0; i < allButtonEls.length; i++) {
                        var btnEl = allButtonEls[i];
                        if (angular.element(btnEl)
                                .attr('type') === 'submit') {
                            submitBtnEls.push(btnEl);
                        }
                    }
                    return angular.element(submitBtnEls);
                }


                // INIT
                // check if there is any value given via attrs.promiseBtn
                if (!attrs.promiseBtn) {
                    // handle ngClick function directly returning a promise
                    if (attrs.hasOwnProperty(CLICK_ATTR)) {
                        appendSpinnerTpl(el);
                        addHandlersForCurrentBtnOnly(el);
                        initHandlingOfViewFunctionsReturningAPromise(CLICK_EVENT, CLICK_ATTR, el);
                    }
                    // handle ngSubmit function directly returning a promise
                    else if (attrs.hasOwnProperty(SUBMIT_ATTR)) {
                        // get child submits for form elements
                        var btnElements = getSubmitBtnChildren(el);

                        appendSpinnerTpl(btnElements);
                        addHandlersForCurrentBtnOnly(btnElements);
                        initHandlingOfViewFunctionsReturningAPromise(SUBMIT_EVENT, SUBMIT_ATTR, btnElements);
                    }
                }
                // handle promises passed via scope.promiseBtn
                else {
                    appendSpinnerTpl(el);
                    addHandlersForCurrentBtnOnly(el);
                    // handle promise passed directly via attribute as variable
                    initPromiseWatcher(function() {
                        return scope.promiseBtn;
                    }, el);
                }


                // watch and update options being changed
                scope.$watch('promiseBtnOptions', function(newVal) {
                    if (angular.isObject(newVal)) {
                        cfg = angular.extend({}, providerCfg, newVal);
                    }
                }, true);

                // cleanup
                scope.$on('$destroy', function() {
                    $timeout.cancel(minDurationTimeout);
                    $timeout.cancel(revertTimeout);
                });
            }
        };
    }]);
