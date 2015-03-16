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
                        mVal.then(loadingFinished, loadingFinished);
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
            btnLoadingClass: 'is-loading'
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
