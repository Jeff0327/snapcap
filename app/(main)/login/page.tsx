import Link from "next/link";
import RandomImage from "@/components/login/RandomImage";
import LoginForm from "@/components/login/LoginForm";

function Page() {

    return (
        <div className={'grid grid-cols-1 md:grid-cols-2 items-center h-screen'}>
            <div className={'flex justify-center items-center h-full bg-white p-8'}>
                <div className="w-full max-w-md space-y-8">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 font-jalnan">
                            로그인
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            계정이 없으신가요?{' '}
                            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                                회원가입
                            </Link>
                        </p>
                    </div>

                    <LoginForm/>
                </div>
            </div>

            <RandomImage/>
        </div>
    );
}

export default Page;