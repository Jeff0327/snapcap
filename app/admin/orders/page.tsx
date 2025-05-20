import React from 'react';
import {getOrderList} from "./actions";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import OrderList from "@/components/admin/orders/OrderList";

export const dynamic = 'force-dynamic';

async function OrdersPage() {
    const {orders, error} = await getOrderList();

    return (
        <Card>
            <CardHeader>
                <h1 className="text-xl font-GongGothic">주문 내역</h1>
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
                    <OrderList orders={orders}/>
                )}
            </CardContent>
        </Card>

    );
}

export default OrdersPage;