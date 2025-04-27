'use client'
import React, {forwardRef} from "react";
import Form from "next/form";
import useAlert from "@/lib/notiflix/useAlert";
import {useRouter} from "next/navigation";
import {ERROR_CODES, getErrorMessage} from "@/utils/ErrorMessage";

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
}

const FormContainer = forwardRef<HTMLFormElement, FormContainerProps>(({
                                                                         action,
                                                                         children,
                                                                         onResult,
                                                                         onSubmit
                                                                       }, ref) => {
  const router = useRouter();
  const {notify} = useAlert();

  const handleAction = async (formData: FormData) => {
    try {
      // If onSubmit handler exists and returns false, prevent form submission
      if (onSubmit) {
        const formEvent = new Event('submit') as unknown as React.FormEvent;
        const shouldContinue = onSubmit(formEvent);
        if (shouldContinue === false) {
          return;
        }
      }

      const result = await action(formData);

      if (onResult) {
        onResult(result);
        return;
      }

      // 실시간 응답처리
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