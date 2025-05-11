import React from 'react';
import { createClient } from "@/utils/server";
import { redirect } from "next/navigation";
import { CartList } from "@/components/main/cart/CartList";
import { getCartItems } from "@/app/(main)/cart/actions";
import { Suspense } from 'react';
import {CartItemSkeleton} from "@/components/cart/CartItemSkeleton";


// 에러 처리를 위한 컴포넌트
function CartErrorBoundary({ error }: { error: Error }) {
    return (
        <div className="text-center py-8">
            <h2 className="text-xl font-bold text-red-500 mb-2">장바구니 불러오기 실패</h2>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <p className="text-sm text-gray-500">페이지를 새로고침하거나 나중에 다시 시도해주세요.</p>
        </div>
    );
}

// 실제 장바구니 컨텐츠를 로드하는 컴포넌트
async function CartContent({ userId }: { userId: string }) {
    try {
        // 장바구니 항목 조회 - 최적화된 쿼리로 필요한 정보만 가져옴
        const cartItems = await getCartItems(userId);

        return <CartList initialCartItems={cartItems} />;
    } catch (error) {
        console.error('장바구니 로딩 오류:', error);
        return <CartErrorBoundary error={error instanceof Error ? error : new Error('장바구니를 불러오는데 실패했습니다.')} />;
    }
}

async function Page() {
    // 사용자 인증 확인
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
    if (!user) return redirect('/login');

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            <Suspense fallback={<CartItemSkeleton count={3} />}>
                <CartContent userId={user.id} />
            </Suspense>
        </div>
    );
}

export default Page;