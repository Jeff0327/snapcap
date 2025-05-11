// app/(main)/orders/page.tsx
import React from 'react';
import { createClient } from "@/utils/server";
import { redirect } from "next/navigation";
import { getUserOrders } from "./actions";
import OrderList from "@/components/order/orderList/OrderList";


async function Page() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const result = await getUserOrders();

    // 빈 배열로 기본값 설정
    const orders = result.success ? (result.data || []) : [];

    return (
        <div className="max-w-4xl mx-auto p-8 mt-8 lg:mt-12">
            <h1 className="text-2xl font-jalnan mb-6">주문 내역</h1>

            {!result.success ? (
                <div className="bg-red-100 text-red-700 p-4 rounded-md">
                    {result.message || '주문 목록을 불러오는데 실패했습니다.'}
                </div>
            ) : (
                <OrderList orders={orders} />
            )}
        </div>
    );
}

export default Page;