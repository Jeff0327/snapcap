// app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { CookieOptions } from '@supabase/ssr';

// 쿠키 객체 타입 정의
interface Cookie {
    name: string;
    value: string;
    options?: CookieOptions;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    // 새 응답 객체 생성
    const response = NextResponse.redirect(new URL('/', request.url));

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    // 타입을 명시적으로 지정하여 반환
                    return Array.from(request.cookies.getAll()).map((cookie): Cookie => ({
                        name: cookie.name,
                        value: cookie.value
                    }));
                },
                setAll(cookiesList: Cookie[]) {
                    cookiesList.forEach(({ name, value, options }) => {
                        response.cookies.set({
                            name,
                            value,
                            ...options
                        });
                    });
                }
            }
        }
    );

    if (code) {
        try {
            await supabase.auth.exchangeCodeForSession(code);
        } catch (error) {
            console.error('Error exchanging code for session:', error);
            return NextResponse.redirect(new URL('/auth/error', request.url));
        }
    }

    return response;
}