'use client'
import {useEffect} from 'react';
import Notiflix, { INotifyOptions, IReportOptions, IConfirmOptions, ILoadingOptions } from 'notiflix';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectMethod {
    (
        title: string,
        message: string,
        options: SelectOption[],
        okButtonText: string,
        cancelButtonText: string,
        onSelect: (selectedValue: string) => void,
        onCancel?: () => void
    ): void;
}

interface NotifyMethods {
    success: (message: string) => void;
    failure: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
}

interface ReportMethods {
    success: (title: string, message: string, buttonText: string) => void;
    failure: (title: string, message: string, buttonText: string) => void;
    warning: (title: string, message: string, buttonText: string) => void;
    info: (title: string, message: string, buttonText: string) => void;
}

interface ConfirmMethod {
    (title: string, message: string, okText: string, cancelText: string): Promise<boolean>;
}

interface LoadingMethods {
    start: (message?: string) => void;
    remove: () => void;
}

interface PromptMethod {
    (
        title: string,
        message: string,
        defaultAnswer: string,
        okButtonText: string,
        cancelButtonText: string,
        onOkCallback: (clientAnswer: string) => void,
        onCancelCallback: (clientAnswer: string) => void,
        options?: Partial<IConfirmOptions>
    ): void;
}

interface UseNotiflixReturn {
    notify: NotifyMethods;
    report: ReportMethods;
    confirm: ConfirmMethod;
    loading: LoadingMethods;
    prompt: PromptMethod;
    select: SelectMethod;
}

const useAlert = (): UseNotiflixReturn => {
    useEffect(() => {
        const notifyOptions: INotifyOptions = {
            plainText: false,
            position: window.innerWidth <= 768 ? 'center-top' : 'right-bottom',
            timeout: 3000,
            fontFamily: 'Pretendard',
        };

        const reportOptions: IReportOptions = {
            plainText: false,
            titleFontSize: '18px',
            messageFontSize: '14px',
            fontFamily: 'Pretendard',
            cssAnimationStyle : 'zoom',
            backOverlayClickToClose: true,
            success: {
                svgColor: '#736BD1',
                titleColor: '#161521',
                messageColor: '#242424',
                buttonBackground: '#32c682',
                buttonColor: '#fff',
                backOverlayColor: 'rgba(0,0,0,0.7)',
            },
            failure: {
                svgColor: '#ff5549',
                titleColor: '#161521',
                messageColor: '#242424',
                buttonBackground: '#ff5549',
                buttonColor: '#fff',
                backOverlayColor: 'rgba(0,0,0,0.7)',
            },
            warning: {
                svgColor: '#eebf31',
                titleColor: '#161521',
                messageColor: '#242424',
                buttonBackground: '#eebf31',
                buttonColor: '#fff',
                backOverlayColor: 'rgba(0,0,0,0.7)',
            },
            info: {
                svgColor: '#26c0d3',
                titleColor: '#161521',
                messageColor: '#242424',
                buttonBackground: '#26c0d3',
                buttonColor: '#fff',
                backOverlayColor: 'rgba(0,0,0,0.7)',
            },
        };

        const confirmOptions: IConfirmOptions = {
            plainText: false,
            titleColor : '#000',
            okButtonBackground: '#736BD1',
            cancelButtonBackground: '#FF5E5E',
            titleMaxLength : 26,
            fontFamily: 'KIMM_Bold',
        };

        const loadingOptions: ILoadingOptions = {
            svgColor: '#736BD1',
        };
        Notiflix.Notify.init(notifyOptions);
        Notiflix.Report.init(reportOptions);
        Notiflix.Confirm.init(confirmOptions);
        Notiflix.Loading.init(loadingOptions);
    }, []);

    const notify: NotifyMethods = {
        success: (message: string) => Notiflix.Notify.success(message.replace(/\n/g, '<br/>')),
        failure: (message: string) => Notiflix.Notify.failure(message.replace(/\n/g, '<br/>')),
        warning: (message: string) => Notiflix.Notify.warning(message.replace(/\n/g, '<br/>')),
        info: (message: string) => Notiflix.Notify.info(message.replace(/\n/g, '<br/>')),
    };

    const report: ReportMethods = {
        success: (title: string, message: string, buttonText: string) =>
            Notiflix.Report.success(title, message, buttonText,{
                plainText: false
            }),
        failure: (title: string, message: string, buttonText: string,) =>
            Notiflix.Report.failure(title, message, buttonText,{
                plainText: false
            }),
        warning: (title: string, message: string, buttonText: string) =>
            Notiflix.Report.warning(title, message, buttonText,{
                plainText: false
            }),
        info: (title: string, message: string, buttonText: string) =>
            Notiflix.Report.info(title, message, buttonText,{
                plainText: false
            }),
    };

    const confirm = (title: string, message: string, okText = '확인', cancelText = '취소'): Promise<boolean> => {
        return new Promise<boolean>((resolve) => {
            Notiflix.Confirm.show(
                title,
                message,
                okText,
                cancelText,
                () => resolve(true),
                () => resolve(false)
            );
        });
    };

    const loading: LoadingMethods = {
        start: (message?: string) => Notiflix.Loading.standard(message),
        remove: () => Notiflix.Loading.remove(),
    };

    const prompt: PromptMethod = (
        title,
        message,
        defaultAnswer,
        okButtonText,
        cancelButtonText,
        onOkCallback,
        onCancelCallback,
        options = {}
    ) => {
        Notiflix.Confirm.prompt(
            title,
            message,
            defaultAnswer,
            okButtonText,
            cancelButtonText,
            onOkCallback,
            onCancelCallback,
            {
                ...options,
                plainText: false, // HTML 허용
                messageMaxLength:100,
            }
        );
    };

    const select: SelectMethod = (
        title,
        message,
        options,
        okButtonText,
        cancelButtonText,
        onSelect,
        onCancel
    ) => {
        const selectHtml = `
            ${message}<br/><br/>
            <select id="notiflix-select" 
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; 
                           border-radius: 4px; margin-top: 10px; 
                           font-family: inherit; font-size: 14px;">
                ${options.map(opt =>
            `<option value="${opt.value}">${opt.label}</option>`
        ).join('')}
            </select>
        `;

        Notiflix.Confirm.show(
            title,
            selectHtml,
            okButtonText,
            cancelButtonText,
            () => {
                const select = document.getElementById('notiflix-select') as HTMLSelectElement;
                if (select) {
                    onSelect(select.value);
                }
            },
            () => {
                if (onCancel) onCancel();
            },
            {
                plainText: false,
                cssAnimationStyle: 'zoom',
                messageMaxLength: 1000,
            }
        );
    };

    return { notify, report, confirm, loading, prompt, select };
};

export default useAlert;