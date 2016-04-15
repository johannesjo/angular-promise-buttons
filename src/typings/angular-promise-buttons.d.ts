declare module angularPromiseButtons
{
    interface IPromiseButtonConfig
    {
        spinnerTpl: string;
        disableBtn: boolean;
        btnLoadingClass: string;
        btnLoadingHtml: string;
        addClassToCurrentBtnOnly: boolean;
        disableCurrentBtnOnly: boolean;
        defaultHtml: string;
        onComplete: () => void;
        onSuccessConfig: IPromiseButtonResultConfig;
        onErrorConfig: IPromiseButtonResultConfig;
    }

    interface IPromiseButtonResultConfig
    {
        handlerFunction: () => void;
        resultWaitTime: number;
        resultHtml: string;
        resultCssClass: string
    }
}