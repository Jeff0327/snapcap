import { createClient } from "@/utils/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/';

    console.log('Auth 콜백 시작 - code 존재:', !!code);

    if (code) {
        try {
            // 쿠키 저장소 접근
            const cookieStore = await cookies();
            console.log('콜백 전 쿠키:', cookieStore.getAll().map(c => c.name));

            // Supabase 클라이언트 생성
            const supabase = await createClient();

            // 코드를 세션으로 교환
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            console.log('ddd:',data)
            if (error) {
                console.error('세션 교환 오류:', error);
                return NextResponse.redirect(`${origin}/auth/auth-code-error`);
            }

            console.log('세션 교환 성공:', !!data.session);

            // 사용자 정보 로깅
            const { data: userData } = await supabase.auth.getUser();
            console.log('인증된 사용자:', userData.user ? {
                id: userData.user.id,
                email: userData.user.email,
                provider: userData.user.app_metadata?.provider
            } : '사용자 정보 없음');



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

    console.log('코드 없음 - 오류 페이지로 리디렉트');
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}