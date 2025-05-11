'use client'
import React, { forwardRef } from "react";
import Form from "next/form";
import useAlert from "@/lib/notiflix/useAlert";
import { useRouter } from "next/navigation";
import { ERROR_CODES, getErrorMessage } from "@/utils/ErrorMessage";

export interface FormState<T = unknown> {
    code: number;
    message: string;
    redirect?: string;
    data?: T;
}

interface FormContainerProps<T = unknown> {
    action: (formData: FormData) => Promise<FormState<T>>;
    children: React.ReactNode;
    onResult?: (result: FormState<T>) => void;
    onSubmit?: (e: React.FormEvent) => boolean | void;
    onBeforeSubmit?: () => boolean;
}

const FormContainer = forwardRef<HTMLFormElement, FormContainerProps>(({
                                                                           action,
                                                                           children,
                                                                           onResult,
                                                                           onSubmit,
                                                                           onBeforeSubmit,
                                                                       }, ref) => {
    const router = useRouter();
    const { notify } = useAlert();

    const handleAction = async (formData: FormData) => {
        try {
            // 제출 전 검증 로직 실행 (onBeforeSubmit이 있는 경우)
            if (onBeforeSubmit && !onBeforeSubmit()) {
                // onBeforeSubmit이 false를 반환하면 폼 제출을 중단
                return;
            }

            // 커스텀 제출 이벤트 핸들러 실행 (있는 경우)
            if (onSubmit) {
                const formEvent = new Event('submit') as unknown as React.FormEvent;
                const shouldContinue = onSubmit(formEvent);
                if (shouldContinue === false) {
                    return;
                }
            }

            // 서버 액션 실행
            const result = await action(formData);

            // 결과 콜백이 있으면 호출하고 기본 처리 종료
            if (onResult) {
                onResult(result);
                return;
            }

            // 기본 결과 처리 로직
            if (result.code === ERROR_CODES.SUCCESS) {
                notify.success(result.message);
                if (result.redirect) {
                    router.push(result.redirect);
                }
                return;
            }

            // 오류 코드별 처리
            notify.failure(getErrorMessage(result.code, result.message));

        } catch (error) {
            console.error('Form submission error:', error);
            notify.failure(getErrorMessage(ERROR_CODES.SERVER_ERROR));
        }
    };

    return (
        <Form ref={ref} action={handleAction}>
            {children}
        </Form>
    );
});

FormContainer.displayName = 'FormContainer';

export default FormContainer;