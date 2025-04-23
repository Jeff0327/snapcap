'use client'
import React from 'react';
import FormContainer, {FormState} from "@/components/ui/form";
import {signIn, signInWithGoogle, signInWithKakao} from "@/app/(main)/login/actions";
import Link from "next/link";
import {ERROR_CODES} from "@/utils/ErrorMessage";
import useAlert from "@/lib/notiflix/useAlert";
import {useRouter} from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { RiKakaoTalkFill } from "react-icons/ri";
import {supabase} from "@/utils/supabase";

function LoginForm() {
    const {notify} = useAlert()
    const router = useRouter()

    const handleResult = (formState: FormState) => {
        if(formState.code === ERROR_CODES.SUCCESS){
            notify.success('로그인 하셨습니다. 환영합니다!')
            router.push('/')
        } else {
            notify.failure('아이디 비밀번호를 확인해주세요.')
        }
    }

    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithGoogle();
            if(result.code === ERROR_CODES.SUCCESS) {
                notify.success('구글 계정으로 로그인되었습니다.');
                router.push('/');
            } else {
                notify.failure('구글 로그인 중 오류가 발생했습니다.');
            }
        } catch (error) {
            notify.failure('구글 로그인 처리 중 오류가 발생했습니다.');
        }
    }

    const handleKakaoLogin = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'kakao',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    skipBrowserRedirect: false // 이 옵션이 중요합니다
                }
            });

            if (error) throw error;

            // 리다이렉션 URL로 직접 이동
            if (data?.url) {
                window.location.href = data.url;
            } else {
                notify.failure('카카오 로그인 URL을 가져오는데 실패했습니다.');
            }
        } catch (error) {
            console.error('카카오 로그인 처리 오류:', error);
            notify.failure('카카오 로그인 중 오류가 발생했습니다.');
        }
    };

    return (
        <FormContainer action={signIn} onResult={handleResult}>
            <input type="hidden" name="remember" defaultValue="true" />
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

            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                    <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                        로그인 상태 유지
                    </label>
                </div>

                <div className="text-sm">
                    <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                        비밀번호를 잊으셨나요?
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

            <div className="mt-4 space-y-3">
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="group relative w-full flex justify-center items-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <FcGoogle className="w-5 h-5 mr-2" />
                    구글로 로그인
                </button>

                <button
                    type="button"
                    onClick={handleKakaoLogin}
                    className="group relative w-full flex justify-center items-center py-2 px-4 border border-yellow-500 text-sm font-medium rounded-md text-yellow-900 bg-yellow-400 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                    <RiKakaoTalkFill className="w-5 h-5 mr-2" />
                    카카오로 로그인
                </button>
            </div>
        </FormContainer>
    );
}

export default LoginForm;