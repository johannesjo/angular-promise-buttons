declare module angularPromiseButtons {
    interface IPromiseButtonsProvider {
        extendConfig: (config: IPromiseButtonConfigOptions) => void
        $get: () => IPromiseButtonConfig;
    }

    interface IPromiseButtonConfigOptions {
        spinnerTpl?: string;
        disableBtn?: boolean;
        btnLoadingClass?: string;
        btnLoadingHtml?: string;
        addClassToCurrentBtnOnly?: boolean;
        disableCurrentBtnOnly?: boolean;
        defaultHtml?: string;
        onCompleteHandlerFunction?: () => void;
        onSuccessConfig?: IPromiseButtonResultConfigOptions;
        onErrorConfig?: IPromiseButtonResultConfigOptions;
    }

    interface IPromiseButtonResultConfigOptions {
        handlerFunction?: () => void;
        resultWaitTime?: number;
        resultHtml?: string;
        resultCssClass?: string
    }

    interface IPromiseButtonConfig extends IPromiseButtonConfigOptions {
        spinnerTpl: string;
        disableBtn: boolean;
        btnLoadingClass: string;
        btnLoadingHtml: string;
        addClassToCurrentBtnOnly: boolean;
        disableCurrentBtnOnly: boolean;
        defaultHtml: string;
        onCompleteHandlerFunction: () => void;
        onSuccessConfig: IPromiseButtonResultConfig;
        onErrorConfig: IPromiseButtonResultConfig;
    }

    interface IPromiseButtonResultConfig extends IPromiseButtonResultConfigOptions {
        handlerFunction: () => void;
        resultWaitTime: number;
        resultHtml: string;
        resultCssClass: string
    }
}