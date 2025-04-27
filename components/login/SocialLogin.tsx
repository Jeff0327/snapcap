'use client'
import React from 'react';
import {FcGoogle} from "react-icons/fc";
import {RiKakaoTalkFill} from "react-icons/ri";
import {signInWithGoogle, signInWithKakao} from "@/app/(main)/login/actions";
import {useRouter} from "next/navigation";
import {ERROR_CODES} from "@/utils/ErrorMessage";

interface SocialAuthData {
    url: string;
    [key: string]: any;
}
function SocialLogin() {
    const router = useRouter();

    const handleSocialLogin = async (provider: 'kakao' | 'google') => {
        try {
            const result = provider === 'kakao'
                ? await signInWithKakao()
                : await signInWithGoogle();

            if (result.code === ERROR_CODES.SUCCESS) {
                if (result.redirect) {
                    // 서버 액션에서 제공한 리디렉션 경로 사용
                    router.push(result.redirect);
                } else if (result.data && typeof result.data === 'object' && 'url' in result.data) {
                    // OAuth 제공자가 반환한 URL로 리디렉션
                    window.location.href = result.data.url as string;
                }
            }
        } catch (error) {
            console.error('로그인 처리 중 오류 발생:', error);
        }
    };
    return (
        <div className="mt-4 space-y-3">
            <button
                type="button"
                onClick={()=>handleSocialLogin('google')}
                className="group relative w-full flex justify-center items-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                <FcGoogle className="w-5 h-5 mr-2"/>
                구글로 로그인
            </button>

            <button
                type="button"
                onClick={()=>handleSocialLogin('kakao')}
                className="group relative w-full flex justify-center items-center py-2 px-4 border border-yellow-500 text-sm font-medium rounded-md text-yellow-900 bg-yellow-400 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
                <RiKakaoTalkFill className="w-5 h-5 mr-2"/>
                카카오로 로그인
            </button>
        </div>
    );
}

export default SocialLogin;