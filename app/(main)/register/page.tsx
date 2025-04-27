import React from 'react';
import Link from "next/link";
import RandomImage from "@/components/login/RandomImage";
import RegisterForm from "@/components/register/RegisterForm";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FaHatCowboy } from "react-icons/fa";

function Page() {
    return (
        <div className={'grid grid-cols-1 md:grid-cols-2 items-center h-screen'}>
            <div className={'flex justify-center items-center h-full bg-white p-8'}>
                <div className="w-full max-w-md space-y-8">
                    <div className="flex flex-col items-center">
                        <FaHatCowboy className="h-12 w-12 text-blue-600" />
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 font-jalnan">
                            회원가입
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            이미 계정이 있으신가요?{' '}
                            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                                로그인
                            </Link>
                        </p>
                    </div>

                    <Alert className="bg-blue-50 border-blue-100">
                        <AlertDescription className="text-sm text-gray-700">
                            가입하시면 최신 모자 컬렉션 소식과 특별 할인 혜택을 받아보실 수 있습니다.
                        </AlertDescription>
                    </Alert>

                    <RegisterForm />
                </div>
            </div>

            <RandomImage />
        </div>
    );
}

export default Page;