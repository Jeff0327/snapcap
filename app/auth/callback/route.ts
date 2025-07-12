import { createClient } from "@/utils/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/';

    if (code) {
        try {
            // 쿠키 저장소 접근
            const cookieStore = await cookies();

            // Supabase 클라이언트 생성
            const supabase = await createClient();

            // 코드를 세션으로 교환
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) {
                console.error('세션 교환 오류:', error);
                return NextResponse.redirect(`${origin}/auth/auth-code-error`);
            }

            // 사용자 정보 로깅
            const { data: userData } = await supabase.auth.getUser();

            // 응답 생성 및 쿠키 설정 명시적 추가
            const response = NextResponse.redirect(`${origin}${next}`);

            // 설정된 쿠키 복사
            cookieStore.getAll().forEach(cookie => {
                // auth 관련 쿠키만 복사
                if (cookie.name.includes('auth-token')) {
                    response.cookies.set({
                        name: cookie.name,
                        value: cookie.value,
                        path: '/',
                        sameSite: 'lax',
                        secure: process.env.NODE_ENV !== 'development',
                        httpOnly: true,
                        maxAge: 60 * 60 * 24 * 7 // 7일
                    });
                }
            });

            return response;
        } catch (error) {
            console.error('Auth 콜백 처리 오류:', error);
            return NextResponse.redirect(`${origin}/auth/auth-code-error`);
        }
    }
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}