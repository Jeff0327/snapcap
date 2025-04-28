// app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        // Exchange code for session
        await supabase.auth.exchangeCodeForSession(code);

        // 세션 교환 후 사용자 정보 확인 (디버깅용)
        const { data: { user } } = await supabase.auth.getUser();
        console.log('콜백에서 사용자 확인:', user);

        // 인증 후 리다이렉트할 경로
        return NextResponse.redirect(new URL('/', request.url));
    }

    // code가 없는 경우 로그인 페이지로 리다이렉트
    return NextResponse.redirect(new URL('/login', request.url));
}