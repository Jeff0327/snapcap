'use server'

import { createClient } from "@/utils/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {FormState} from "@/components/ui/form";
import {ERROR_CODES} from "@/utils/ErrorMessage";

export async function updateEmail(formData: FormData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const newEmail = formData.get('email') as string;

    if (!newEmail) {
        return { error: '이메일을 입력해주세요.' };
    }

    const { error } = await supabase.auth.updateUser({
        email: newEmail
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/profile');
    return { success: '이메일 변경 요청이 전송되었습니다. 새 이메일에서 확인해주세요.' };
}

export async function updatePassword(formData: FormData):Promise<FormState> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    try{
        if (!currentPassword || !newPassword || !confirmPassword) {
            return {
                code:ERROR_CODES.VALIDATION_ERROR,
                message:'비밀번호를 모두 입력해주세요.'
            };
        }

        if (newPassword !== confirmPassword) {
            return {
                code:ERROR_CODES.VALIDATION_ERROR,
                message:'새 비밀번호가 일치하지않습니다.'
            };
        }

        if (newPassword.length < 6) {
            return {
                code:ERROR_CODES.VALIDATION_ERROR,
                message:'비밀번호는 최소 6자 이상이어야 합니다.'
            };
        }

        // 현재 비밀번호 확인
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email!,
            password: currentPassword
        });

        if (signInError) {
            return {
                code:ERROR_CODES.DB_ERROR,
                message:'현재 비밀번호가 일치하지않습니다.'
            };
        }

        // 새 비밀번호로 업데이트
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            return {
                code:ERROR_CODES.DB_ERROR,
                message:'비밀번호 변경 중 에러가 발생하였습니다.'
            };
        }

        revalidatePath('/profile');
        return {
            code:ERROR_CODES.SUCCESS,
            message:'비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.'
        }

    }catch(error){
        return {
            code:ERROR_CODES.SERVER_ERROR,
            message:'서버에러가 발생하였습니다.'
        }
    }
}