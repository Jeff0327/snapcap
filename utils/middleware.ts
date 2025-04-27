import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
    try {
        console.log('미들웨어 실행 - URL:', request.nextUrl.pathname);
        console.log('쿠키 확인:', request.cookies.getAll().map(c => c.name));

        // 기본 응답 생성
        let response = NextResponse.next();

        // Supabase 클라이언트 생성
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return request.cookies.get(name)?.value;
                    },
                    set(name: string, value: string, options: any) {
                        // 개발 환경에서는 secure=false로 설정(http에서도 쿠키 작동하도록)
                        const isLocalhost = request.headers.get('host')?.includes('localhost');
                        const cookieOptions = {
                            ...options,
                            secure: isLocalhost ? false : options.secure,
                        };

                        response.cookies.set({
                            name,
                            value,
                            ...cookieOptions,
                        });
                    },
                    remove(name: string, options: any) {
                        response.cookies.delete({
                            name,
                            ...options,
                        });
                    },
                },
            }
        );

        // 세션 갱신
        const { data, error } = await supabase.auth.getUser();

        console.log('미들웨어에서 사용자 확인:',
            data.user ? `ID: ${data.user.id}, Email: ${data.user.email}` : '로그인되지 않음',
            error ? `오류: ${error.message}` : '오류 없음'
        );

        // 보호된 경로 처리
        if (request.nextUrl.pathname.startsWith("/dashboard") && !data.user) {
            console.log('보호된 경로 접근 시도 - 리다이렉트');
            return NextResponse.redirect(new URL("/login", request.url));
        }

        // 로그인된 사용자가 로그인/회원가입 페이지 접근 시 홈으로 리다이렉트
        if ((request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register") && data.user) {
            console.log('이미 로그인한 사용자가 로그인/회원가입 페이지 접근 - 리다이렉트');
            return NextResponse.redirect(new URL("/", request.url));
        }

        // 응답 쿠키 확인
        console.log('응답 쿠키 설정됨:', response.cookies.getAll().map(c => c.name));

        return response;
    } catch (e) {
        console.error("미들웨어 오류:", e);
        return NextResponse.next();
    }
}

// 미들웨어를 적용할 경로 설정
export const config = {
    matcher: ["/", "/login", "/register", "/dashboard/:path*"],
};