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
            btnLoadingHtml: null,
            addClassToCurrentBtnOnly: false,
            disableCurrentBtnOnly: false,
            defaultHtml: null,
            onComplete: null,
            onSuccessConfig: {
                handlerFunction: null,
                resultWaitTime: 0,
                resultHtml: 'Success',
                resultCssClass: 'loading-success'
            },
            onErrorConfig: {
                handlerFunction: null,
                resultWaitTime: 0,
                resultHtml: 'Error',
                resultCssClass: 'loading-error'
            }
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
