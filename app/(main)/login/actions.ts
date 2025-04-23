'use server';

// 회원가입
import {supabase} from "@/utils/supabase";
import {ERROR_CODES} from "@/utils/ErrorMessage";
import {FormState} from "@/components/ui/form";

export async function signUp(formData:FormData) {

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });
    return { data, error };
}

// 로그인
export async function signIn(formData: FormData): Promise<FormState> {
    try {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return {
                code: ERROR_CODES.DB_ERROR,
                message: error.message
            };
        }

        return {
            code: ERROR_CODES.SUCCESS,
            message: "로그인에 성공했습니다.",
            redirect:'/'
        };
    } catch (error) {
        console.error("로그인 처리 중 오류 발생:", error);
        return {
            code: ERROR_CODES.SERVER_ERROR,
            message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
        };
    }
}

// 구글 로그인
export async function signInWithGoogle(): Promise<FormState> {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
            }
        });

        if (error) {
            return {
                code: ERROR_CODES.AUTH_ERROR,
                message: error.message
            };
        }

        // 구글 로그인은 리다이렉션을 통해 처리되므로 URL 반환
        return {
            code: ERROR_CODES.SUCCESS,
            message: "구글 로그인으로 리다이렉션됩니다.",
            data: { url: data.url }
        };
    } catch (error) {
        console.error("구글 로그인 처리 중 오류 발생:", error);
        return {
            code: ERROR_CODES.SERVER_ERROR,
            message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
        };
    }
}

// 카카오 로그인
export async function signInWithKakao(): Promise<FormState> {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'kakao',
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
            }
        });

        if (error) {
            return {
                code: ERROR_CODES.AUTH_ERROR,
                message: error.message
            };
        }

        // 카카오 로그인은 리다이렉션을 통해 처리되므로 URL 반환
        return {
            code: ERROR_CODES.SUCCESS,
            message: "카카오 로그인으로 리다이렉션됩니다.",
            data: { url: data.url }
        };
    } catch (error) {
        console.error("카카오 로그인 처리 중 오류 발생:", error);
        return {
            code: ERROR_CODES.SERVER_ERROR,
            message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
        };
    }
}
// 로그아웃
export async function signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
}