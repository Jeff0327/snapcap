'use client'
import FormContainer, {FormState} from "@/components/ui/form";
import {updatePassword} from "@/app/(main)/profile/actions";
import {ERROR_CODES} from "@/utils/ErrorMessage";
import {useRouter} from "next/navigation";
import {signOut} from "@/app/(main)/login/actions";
import useAlert from "@/lib/notiflix/useAlert";

function PasswordUpdateForm() {

    const router = useRouter();
    const {notify}=useAlert()
    const handleResult=async (formState:FormState)=>{
        if(formState.code===ERROR_CODES.SUCCESS){
            await signOut()
            router.push('/login');
        }else{
            notify.failure(formState.message);
        }
    }
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">비밀번호 변경</h3>
            </div>

            <FormContainer action={updatePassword} onResult={handleResult}>
                <div>
                    <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-2">
                        현재 비밀번호
                    </label>
                    <input
                        type="password"
                        id="current-password"
                        name="currentPassword"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        placeholder="현재 비밀번호를 입력하세요"
                    />
                </div>

                <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">
                        새 비밀번호
                    </label>
                    <input
                        type="password"
                        id="new-password"
                        name="newPassword"
                        required
                        minLength={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        placeholder="새 비밀번호를 입력하세요 (최소 6자)"
                    />
                </div>

                <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                        새 비밀번호 확인
                    </label>
                    <input
                        type="password"
                        id="confirm-password"
                        name="confirmPassword"
                        required
                        minLength={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        placeholder="새 비밀번호를 다시 입력하세요"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>비밀번호 변경</span>
                </button>
            </FormContainer>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                    <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    안전한 비밀번호를 위해 대소문자, 숫자, 특수문자를 조합하여 사용하세요.
                </p>
            </div>
        </div>
    );
}
export default PasswordUpdateForm