import React from 'react';
import { createClient } from "@/utils/server";
import { redirect } from "next/navigation";
import { getCartItems } from "@/app/(main)/cart/actions";
import OrderFormMultiple from "@/app/(main)/order/form";

export default async function Page({
                                       searchParams
                                   }: {
    searchParams: Promise<{ orderAll?: string }>
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return redirect('/login');
    const {orderAll} = await searchParams;

    // 장바구니 전체 주문 확인

    if (orderAll!=='true') {
        // 전체 주문이 아니면 홈으로 리다이렉트
        return redirect('/main');
    }

    // 장바구니 아이템 가져오기
    const cartItems = await getCartItems(user.id);

    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="container mx-auto p-4 text-center">
                <h1 className="text-2xl font-bold mb-6">장바구니가 비어있습니다.</h1>
                <p className="mb-4">주문할 상품이 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8">
            <div className="p-4 w-full bg-white mt-12 dark:bg-[#121212] text-black">
                <h1 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">배송정보</h1>
                <OrderFormMultiple cartItems={cartItems} user={user}/>
            </div>
        </div>
    );
}