'use server'
import { ERROR_CODES } from "@/utils/ErrorMessage";
import { createClient } from "@/utils/server";

export async function signUp(formData: FormData) {
    try {
        const supabase = await createClient();

        // Get form data
        const email = formData.get('email')?.toString();
        const password = formData.get('password')?.toString();
        const hasAgreedToTerms = formData.get('terms') === 'on';

        // Validate
        if (!email || !password || !hasAgreedToTerms) {
            return {
                code: ERROR_CODES.VALIDATION_ERROR,
                message: '모든 필드는 필수입니다.'
            };
        }

        // Create the user with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
                data: {
                    role: 'user',
                    agreed_to_terms: hasAgreedToTerms,
                    registration_date: new Date().toISOString(),
                }
            }
        });

        if (error) {
            console.error('Supabase auth error:', error);

            // Check for duplicate email
            if (error.message.includes('email') && error.message.includes('already')) {
                return {
                    code: ERROR_CODES.EMAIL_EXISTS,
                    message: '이미 등록된 이메일 주소입니다.'
                };
            }

            return {
                code: ERROR_CODES.AUTH_ERROR,
                message: error.message
            };
        }

        // Success!
        return {
            code: ERROR_CODES.SUCCESS,
            message: '회원가입이 완료되었습니다. 이메일 확인을 부탁드립니다.',
            redirect: '/login'
        };

    } catch (error) {
        console.error('Registration error:', error);
        return {
            code: ERROR_CODES.SERVER_ERROR,
            message: '서버 오류가 발생했습니다. 나중에 다시 시도해주세요.'
        };
    }
}