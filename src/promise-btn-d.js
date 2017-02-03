angular.module('angularPromiseButtons')
    .directive('promiseBtn', ['angularPromiseButtons', '$parse', '$timeout', '$compile', function(angularPromiseButtons, $parse, $timeout, $compile) {
        'use strict';

        return {
            restrict: 'EA',
            priority: angularPromiseButtons.config.priority,
            scope: {
                promiseBtn: '=',
                promiseBtnOptions: '=?'
            },
            link: function(scope, el, attrs) {
                // provide configuration
                var cfg = angularPromiseButtons.config;
                // later initialized via initPromiseWatcher()
                var promiseWatcher;
                //  timeout used
                var minDurationTimeout;
                // boolean to determine minDurationTimeout state
                var minDurationTimeoutDone;
                // boolean to determine if promise was resolved
                var promiseDone;


                /**
                 * Handles everything to be triggered when the button is set
                 * to loading state.
                 * @param {Object}btnEl
                 */
                function initLoadingState(btnEl) {
                    if (cfg.btnLoadingClass && !cfg.addClassToCurrentBtnOnly) {
                        btnEl.addClass(cfg.btnLoadingClass);
                    }
                    if (cfg.disableBtn && !cfg.disableCurrentBtnOnly) {
                        btnEl.attr('disabled', 'disabled');
                    }
                }

                /**
                 * Handles everything to be triggered when loading is finished
                 * @param {Object}btnEl
                 */
                function handleLoadingFinished(btnEl) {
                    if ((!cfg.minDuration || minDurationTimeoutDone) && promiseDone) {
                        if (cfg.btnLoadingClass) {
                            btnEl.removeClass(cfg.btnLoadingClass);
                        }
                        if (cfg.disableBtn) {
                            btnEl.removeAttr('disabled');
                        }
                    }
                }

                /**
                 * Initializes a watcher for the promise. Also takes
                 * cfg.minDuration into account if given.
                 * @param {Function}watchExpressionForPromise
                 * @param {Object}btnEl
                 */
                function initPromiseWatcher(watchExpressionForPromise, btnEl) {
                    // watch promise to resolve or fail
                    scope.$watch(watchExpressionForPromise, function(mVal) {
                        minDurationTimeoutDone = false;
                        promiseDone = false;

                        // create timeout if option is set
                        if (cfg.minDuration) {
                            minDurationTimeout = $timeout(function() {
                                minDurationTimeoutDone = true;
                                handleLoadingFinished(btnEl);
                            }, cfg.minDuration);
                        }

                        // for regular promises
                        if (mVal && mVal.then) {
                            initLoadingState(btnEl);
                            mVal.finally(function() {
                                promiseDone = true;
                                handleLoadingFinished(btnEl);
                            });
                        }
                        // for $resource
                        else if (mVal && mVal.$promise) {
                            initLoadingState(btnEl);
                            mVal.$promise.finally(function() {
                                promiseDone = true;
                                handleLoadingFinished(btnEl);
                            });
                        }
                    });
                }


                /**
                 * Get the callbacks from the (String) expression given.
                 * @param {String}expression
                 * @returns {Array}
                 */
                function getCallbacks(expression) {
                    return expression
                    // split by ; to get different functions if any
                        .split(';')
                        .map(function(callback) {
                            // return getter function
                            return $parse(callback);
                        });
                }

                /**
                 * $compile and append the spinner template to the button.
                 * @param {Object}btnEl
                 */
                function appendSpinnerTpl(btnEl) {
                    btnEl.append($compile(cfg.spinnerTpl)(scope));
                }

                /**
                 * Used to limit loading state to show only for the currently
                 * clicked button.
                 * @param {Object}btnEl
                 */
                function addHandlersForCurrentBtnOnly(btnEl) {
                    // handle current button only options via click
                    if (cfg.addClassToCurrentBtnOnly) {
                        btnEl.on(cfg.CLICK_EVENT, function() {
                            btnEl.addClass(cfg.btnLoadingClass);
                        });
                    }

                    if (cfg.disableCurrentBtnOnly) {
                        btnEl.on(cfg.CLICK_EVENT, function() {
                            btnEl.attr('disabled', 'disabled');
                        });
                    }
                }

                /**
                 * Used for the function syntax of the promise button directive by
                 * parsing the expressions provided by the attribute via getCallbacks().
                 * Unbinds the default event handlers, which is why it might sometimes
                 * be required to use the promise syntax.
                 * @param {Object}eventToHandle
                 * @param {String}attrToParse
                 * @param {Object}btnEl
                 */
                function initHandlingOfViewFunctionsReturningAPromise(eventToHandle, attrToParse, btnEl) {
                    // we need to use evalAsync here, as
                    // otherwise the click or submit event
                    // won't be ready to be replaced
                    scope.$evalAsync(function() {
                        var callbacks = getCallbacks(attrs[attrToParse]);

                        // unbind original click event
                        el.unbind(eventToHandle);

                        // rebind, but this time watching it's return value
                        el.bind(eventToHandle, function(event) {
                            // Make sure we run the $digest cycle
                            scope.$apply(function() {
                                callbacks.forEach(function(cb) {
                                    // execute function on parent scope
                                    // as we're in an isolate scope here
                                    var promise = cb(scope.$parent, {$event: event});

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

                /**
                 * Get's all submit button children of the given element
                 * @param {Object}formEl
                 * @returns {Object}
                 */
                function getSubmitBtnChildren(formEl) {
                    var submitBtnEls = [];
                    var allButtonEls = formEl.find(angularPromiseButtons.config.BTN_SELECTOR);

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
                // ---------

                // check if there is any value given via attrs.promiseBtn
                if (!attrs.promiseBtn) {
                    // handle ngClick function directly returning a promise
                    if (attrs.hasOwnProperty(cfg.CLICK_ATTR)) {
                        appendSpinnerTpl(el);
                        addHandlersForCurrentBtnOnly(el);
                        initHandlingOfViewFunctionsReturningAPromise(cfg.CLICK_EVENT, cfg.CLICK_ATTR, el);
                    }
                    // handle ngSubmit function directly returning a promise
                    else if (attrs.hasOwnProperty(cfg.SUBMIT_ATTR)) {
                        // get child submits for form elements
                        var btnElements = getSubmitBtnChildren(el);

                        appendSpinnerTpl(btnElements);
                        addHandlersForCurrentBtnOnly(btnElements);
                        initHandlingOfViewFunctionsReturningAPromise(cfg.SUBMIT_EVENT, cfg.SUBMIT_ATTR, btnElements);
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
                        cfg = angular.extend({}, cfg, newVal);
                    }
                }, true);

                // cleanup
                scope.$on('$destroy', function() {
                    $timeout.cancel(minDurationTimeout);
                });
            }
        };
    }]);
