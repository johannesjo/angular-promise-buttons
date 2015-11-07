angular.module('angularPromiseButtons', [
]);

angular.module('angularPromiseButtons').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('promise-btn-d.html',
    "<button ng-transclude></button>"
  );

}]);

angular.module('angularPromiseButtons')
    .directive('promiseBtn', ['angularPromiseButtons', function (angularPromiseButtons)
    {
        'use strict';

        return {
            restrict: 'EA',
            transclude: true,
            replace: true,
            scope: {
                promiseBtn: '=',
                promiseBtnOptions: '=?'
            },
            templateUrl: 'promise-btn-d.html',
            link: function (scope, el)
            {
                var providerCfg = angularPromiseButtons.config;
                var cfg = providerCfg;

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

                // watch options
                scope.$watch('promiseBtnOptions', function (newVal)
                {
                    if (angular.isObject(newVal)) {
                        cfg = angular.extend({}, providerCfg, newVal);
                    }
                }, true);


                // watch promise to resolve or fail
                scope.$watch(function ()
                {
                    return scope.promiseBtn;
                }, function (mVal)
                {
                    // for regular promises
                    if (mVal && mVal.then) {
                        loading();
                        mVal.finally(loadingFinished);
                    }
                    // for $resource
                    else if (mVal && mVal.$promise) {
                        loading();
                        mVal.$promise.finally(loadingFinished);
                    }
                });
            }
        };
    }]);

angular.module('angularPromiseButtons')
    .provider('angularPromiseButtons', function angularPromiseButtonsProvider()
    {
        'use strict';

        // *****************
        // DEFAULTS & CONFIG
        // *****************

        var config = {
            spinnerTpl: '<span class="btn-spinner"></span>',
            disableBtn: true,
            btnLoadingClass: 'is-loading',
            addClassToCurrentBtnOnly: false,
            disableCurrentBtnOnly: false
        };


        // *****************
        // SERVICE-FUNCTIONS
        // *****************


        // *************************
        // PROVIDER-CONFIG-FUNCTIONS
        // *************************

        return {
            extendConfig: function (newConfig)
            {
                config = angular.extend(config, newConfig);
            },


            // ************************************************
            // ACTUAL FACTORY FUNCTION - used by the directive
            // ************************************************

            $get: function ()
            {
                return {
                    config: config
                };
            }
        };
    });
