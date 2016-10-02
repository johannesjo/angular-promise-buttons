angular.module('angularPromiseButtons')
    .provider('angularPromiseButtons', function angularPromiseButtonsProvider()
    {
        'use strict';

        // *****************
        // DEFAULTS & CONFIG
        // *****************

        var config = {
            spinnerTpl: '<span class="btn-spinner"></span>',
            priority: 0,
            disableBtn: true,
            btnLoadingClass: 'is-loading',
            addClassToCurrentBtnOnly: false,
            disableCurrentBtnOnly: false,
            minDuration: false,
            btnLoadingHtml: null,
            defaultHtml: null,
            onComplete: null,
            onSuccessConfig: {
                handlerFunction: null,
                resultWaitTime: 1000,
                resultHtml: 'Success',
                resultCssClass: 'is-success'
            },
            onErrorConfig: {
                handlerFunction: null,
                resultWaitTime: 1000,
                resultHtml: 'Error',
                resultCssClass: 'is-error'
            },
            CLICK_EVENT: 'click',
            CLICK_ATTR: 'ngClick',
            SUBMIT_EVENT: 'submit',
            SUBMIT_ATTR: 'ngSubmit'
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
