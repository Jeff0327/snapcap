'use client'
import React from 'react';
import FormContainer, {FormState} from "@/components/ui/form";
import {signIn} from "@/app/(main)/login/actions";
import {ERROR_CODES} from "@/utils/ErrorMessage";
import useAlert from "@/lib/notiflix/useAlert";
import {useRouter} from "next/navigation";
import SocialLogin from "@/components/login/SocialLogin";
import Link from "next/link";

function LoginForm() {
    const {notify} = useAlert()
    const router = useRouter()

    const handleResult = (formState: FormState) => {
        if (formState.code === ERROR_CODES.SUCCESS) {
            notify.success('로그인 하셨습니다. 환영합니다!')
            router.push('/')
        } else {
            notify.failure('아이디 비밀번호를 확인해주세요.')
        }
    }

    return (
        <FormContainer action={signIn} onResult={handleResult}>
            <input type="hidden" name="remember" defaultValue="true"/>
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
                        autoComplete="current-password"
                        required
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                        placeholder="비밀번호"
                    />
                </div>
            </div>
            <div className={'flex justify-end items-center mt-2 gap-1'}>
                <div className="text-sm">
                    <Link href="/forget/email" className="font-medium text-blue-600 hover:text-blue-500">
                        아이디 찾기
                    </Link>
                </div>
                <span className={'text-sm border-gray-400 border-r py-1.5'}/>
                <div className="text-sm">
                    <Link href="/forget/password" className="font-medium text-blue-600 hover:text-blue-500">
                        비밀번호 찾기
                    </Link>
                </div>
            </div>
            <div className="mt-6">
                <button
                    type="submit"
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    로그인
                </button>
            </div>
            <div className="flex items-center justify-center mt-4">
                <div className="border-t border-gray-300 flex-grow mr-3"></div>
                <span className="text-sm text-gray-500">또는</span>
                <div className="border-t border-gray-300 flex-grow ml-3"></div>
            </div>
            <SocialLogin/>
        </FormContainer>
    );
}

export default LoginForm;