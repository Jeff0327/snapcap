// app/admin/orders/page.tsx
import React from 'react';
import { getOrderList } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OrderList from "@/components/admin/orders/OrderList";
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function OrdersPage() {
    const { orders, error } = await getOrderList();

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-semibold">주문 관리</h1>
                <div className="flex space-x-2">
                    <Link href="/admin/dashboard" className="px-4 py-2 bg-slate-200 text-slate-800 rounded hover:bg-slate-300">
                        대시보드
                    </Link>
                </div>
            </div>

            <Card>
                <CardHeader className="bg-slate-50">
                    <CardTitle className="text-2xl">주문 내역</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {error ? (
                        <div className="p-4 text-red-500">
                            <p>주문 정보를 불러오는 중 오류가 발생했습니다: {error}</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <p>주문 내역이 없습니다.</p>
                        </div>
                    ) : (
                        <OrderList orders={orders} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default OrdersPage;