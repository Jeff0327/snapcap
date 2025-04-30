import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/server";

export async function updateSession(request: NextRequest) {
    try {
        const url = request.nextUrl.pathname;
        // 기본 응답 생성
        let response = NextResponse.next();

        try {
            // createClient 함수 사용
            const supabase = await createClient();

            // 세션 확인
            const { data: { session } } = await supabase.auth.getSession();

            // 보호된 경로 처리
            if (url.startsWith("/dashboard") && !session) {
                return NextResponse.redirect(new URL("/login", request.url));
            }

            // 로그인된 사용자가 로그인/회원가입 페이지 접근 시 홈으로 리다이렉트
            if ((url === "/login" || url === "/register") && session) {
                return NextResponse.redirect(new URL("/", request.url));
            }
        } catch (authError) {
            console.error('미들웨어 인증 처리 오류:', authError);
        }

        return response;
    } catch (e) {
        console.error("미들웨어 오류:", e);
        return NextResponse.next();
    }
}

// 미들웨어를 적용할 경로 설정
export const config = {
    matcher: ["/", "/login", "/register", "/dashboard/:path*", "/auth/callback"],
};