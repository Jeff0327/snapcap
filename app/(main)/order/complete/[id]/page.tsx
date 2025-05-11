import React from 'react';
import {createClient} from "@/utils/server";
import {redirect} from "next/navigation";
import {getOrdersProduct} from "@/app/(main)/order/payment/[id]/actions";
import OrderInfo from "@/components/order/payment/OrderInfo";
import ShippingInfo from "@/components/order/payment/ShippingInfo";
import OrderProducts from "@/components/order/payment/OrderProducts";

async function Page({params}:{params:Promise<{id:string}>}) {
    const supabase = await createClient()
    const {data:{user}}= await supabase.auth.getUser()
    if(!user) redirect('/login')
    const {id}=await params;
    const result = await getOrdersProduct(id);

    if (!result.success || !result.data) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-3xl mx-auto p-4">
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <h1 className="text-2xl font-bold mb-4">결제 정보를 찾을 수 없습니다.</h1>
                        <p className="text-gray-600">{result.message || '주문 정보를 불러오는 중 오류가 발생했습니다.'}</p>
                    </div>
                </div>
            </div>
        );
    }
    const order = result.data;
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto p-4">
                <h1 className="text-2xl font-bold mb-6">결제 정보</h1>
                <OrderInfo order={order}/>
                <ShippingInfo address={order.address}/>
                <OrderProducts products={order.products}/>
            </div>
        </div>
    )
}

export default Page;