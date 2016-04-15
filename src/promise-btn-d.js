angular.module('angularPromiseButtons')
    .directive('promiseBtn', ['angularPromiseButtons', '$parse', '$timeout', function (angularPromiseButtons, $parse, $timeout)
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

                function setLoadingState(btnEl)
                {
                    if (cfg.btnLoadingClass && !cfg.addClassToCurrentBtnOnly) {
                        btnEl.addClass(cfg.btnLoadingClass);
                    }
                    if (cfg.disableBtn && !cfg.disableCurrentBtnOnly) {
                        btnEl.attr('disabled', 'disabled');
                    }
                    if (cfg.btnLoadingHtml)
                    {
                        btnEl.html(cfg.btnLoadingHtml);
                        appendSpinnerTpl(btnEl);
                    }
                }

                function handleLoadingFinished(btnEl, defaultHtml, onEndConfig)
                {
                    removeLoadingState(btnEl);

                    //OnSuccess or OnError
                    if (onEndConfig.handlerFunction && typeof onEndConfig.handlerFunction === 'function')
                    {
                        onEndConfig.handlerFunction();
                    }

                    if (cfg.onCompleteHandlerFunction && typeof cfg.onCompleteHandlerFunction === 'function')
                    {
                        cfg.onCompleteHandlerFunction();
                    }

                    var waitTime = 0;
                    if (onEndConfig && onEndConfig.resultWaitTime && onEndConfig.resultWaitTime >= 0) {
                        waitTime = onEndConfig.resultWaitTime;
                    }

                    if (waitTime)
                    {
                        setFinishedState(btnEl, onEndConfig);
                    }

                    return $timeout(function() {
                        revertToNormalState(btnEl, defaultHtml, onEndConfig);
                    }, waitTime);
                }

                function setFinishedState(btnEl, onEndConfig)
                {
                    if (onEndConfig)
                    {
                        if (onEndConfig.resultHtml)
                        {
                            btnEl.html(onEndConfig.resultHtml);
                        }
                        if (onEndConfig.resultCssClass)
                        {
                            btnEl.addClass(onEndConfig.resultCssClass);
                        }
                    }
                }

                function removeLoadingState(btnEl)
                {
                    if (cfg.btnLoadingClass) {
                        btnEl.removeClass(cfg.btnLoadingClass);
                    }
                }

                function revertToNormalState(btnEl, defaultHtml, onEndConfig)
                {
                    if (cfg.disableBtn) {
                        btnEl.removeAttr('disabled');
                    }
                    if (defaultHtml) {
                        btnEl.html(defaultHtml);
                    }
                    if (onEndConfig && onEndConfig.resultCssClass)
                    {
                        btnEl.removeClass(onEndConfig.resultCssClass);
                    }
                }

                function initPromiseWatcher(watchExpressionForPromise, btnEl)
                {
                    // watch promise to resolve or fail
                    scope.$watch(watchExpressionForPromise, function (mVal)
                    {
                        var initPromise = null;
                        // for regular promises
                        if (mVal && mVal.then)
                        {
                            initPromise = mVal;
                        }
                        // for $resource
                        else if (mVal && mVal.$promise)
                        {
                            initPromise = mVal.$promise;
                        }

                        if (initPromise)
                        {
                            var defaultHtml = cfg.defaultHtml || btnEl.html();
                            setLoadingState(btnEl);
                            initPromise.then(
                                function() {
                                    handleLoadingFinished(btnEl, defaultHtml, cfg.onSuccessConfig);
                                },
                                function() {
                                    handleLoadingFinished(btnEl, defaultHtml, cfg.onErrorConfig);
                                });
                        }
                    });
                }

                function getCallbacks(expression)
                {
                    return expression
                    // split by ; to get different functions if any
                        .split(';')
                        .map(function (callback)
                        {
                            // return getter function
                            return $parse(callback);
                        });
                }

                function appendSpinnerTpl(btnEl)
                {
                    btnEl.append(cfg.spinnerTpl);
                }

                function addHandlersForCurrentBtnOnly(btnEl)
                {
                    // handle current button only options via click
                    if (cfg.addClassToCurrentBtnOnly) {
                        btnEl.on(CLICK_EVENT, function ()
                        {
                            btnEl.addClass(cfg.btnLoadingClass);
                        });
                    }

                    if (cfg.disableCurrentBtnOnly) {
                        btnEl.on(CLICK_EVENT, function ()
                        {
                            btnEl.attr('disabled', 'disabled');
                        });
                    }
                }

                function initHandlingOfViewFunctionsReturningAPromise(eventToHandle, attrToParse, btnEl)
                {
                    // we need to use evalAsync here, as
                    // otherwise the click or submit event
                    // won't be ready to be replaced
                    scope.$evalAsync(function ()
                    {
                        var callbacks = getCallbacks(attrs[attrToParse]);

                        // unbind original click event
                        el.unbind(eventToHandle);

                        // rebind, but this time watching it's return value
                        el.bind(eventToHandle, function ()
                        {
                            // Make sure we run the $digest cycle
                            scope.$apply(function ()
                            {
                                callbacks.forEach(function (cb)
                                {
                                    // execute function on parent scope
                                    // as we're in an isolate scope here
                                    var promise = cb(scope.$parent, {$event: eventToHandle});

                                    // only init watcher if not done before
                                    if (!promiseWatcher) {
                                        promiseWatcher = initPromiseWatcher(function ()
                                        {
                                            return promise;
                                        }, btnEl);
                                    }
                                });
                            });
                        });
                    });
                }

                function getSubmitBtnChildren(el)
                {
                    var submitBtnEls = [];
                    var allButtonEls = el.find('button');

                    for (var i = 0; i < allButtonEls.length; i++) {
                        var btnEl = allButtonEls[i];
                        if (angular.element(btnEl).attr('type') === 'submit') {
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
                    initPromiseWatcher(function ()
                    {
                        return scope.promiseBtn;
                    }, el);
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
