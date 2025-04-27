'use client'
import React, { useState } from 'react';
import FormContainer, { FormState } from "@/components/ui/form";
import { signUp } from "@/app/(main)/register/actions";
import { ERROR_CODES } from "@/utils/ErrorMessage";
import useAlert from "@/lib/notiflix/useAlert";
import { useRouter } from "next/navigation";
import SocialLogin from "@/components/login/SocialLogin";

function RegisterForm() {
    const { notify } = useAlert();
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordsMatch, setPasswordsMatch] = useState(true);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (confirmPassword && e.target.value !== confirmPassword) {
            setPasswordsMatch(false);
        } else {
            setPasswordsMatch(true);
        }
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
        if (e.target.value && e.target.value !== password) {
            setPasswordsMatch(false);
        } else {
            setPasswordsMatch(true);
        }
    };

    const handleResult = (formState: FormState) => {
        if (formState.code === ERROR_CODES.SUCCESS) {
            notify.success('회원가입이 완료되었습니다!');
            router.push('/login');
        } else if (formState.code === ERROR_CODES.EMAIL_EXISTS) {
            notify.failure('이미 등록된 이메일 주소입니다.');
        } else {
            notify.failure('회원가입 중 오류가 발생했습니다.');
        }
    };

    const validateForm = (e: React.FormEvent) => {
        if (password !== confirmPassword) {
            e.preventDefault();
            setPasswordsMatch(false);
            notify.failure('비밀번호가 일치하지 않습니다.');
            return false;
        }
        return true;
    };

    return (
        <FormContainer action={signUp} onResult={handleResult} onSubmit={validateForm}>
            <div className="rounded-md shadow-sm -space-y-px">
                <div>
                    <label htmlFor="email-address" className="sr-only">
                        이메일 주소
                    </label>
                    <input
                        id="email-address"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                        placeholder="이메일 주소"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="sr-only">
                        비밀번호
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={handlePasswordChange}
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                        placeholder="비밀번호"
                    />
                </div>
                <div>
                    <label htmlFor="confirm-password" className="sr-only">
                        비밀번호 확인
                    </label>
                    <input
                        id="confirm-password"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${!passwordsMatch ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                        placeholder="비밀번호 확인"
                    />
                </div>
            </div>

            {!passwordsMatch && (
                <p className="mt-2 text-sm text-red-600">
                    비밀번호가 일치하지 않습니다.
                </p>
            )}

            <div className="flex items-center mt-4">
                <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                    <span>이용약관 및 개인정보 처리방침에 동의합니다</span>
                </label>
            </div>

            <div className="mt-6">
                <button
                    type="submit"
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    회원가입
                </button>
            </div>

            <div className="flex items-center justify-center mt-4">
                <div className="border-t border-gray-300 flex-grow mr-3"></div>
                <span className="text-sm text-gray-500">또는</span>
                <div className="border-t border-gray-300 flex-grow ml-3"></div>
            </div>
            <SocialLogin />
        </FormContainer>
    );
}

export default RegisterForm;