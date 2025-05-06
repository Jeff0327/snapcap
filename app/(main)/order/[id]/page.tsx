import React from 'react';
import {getOneProduct} from "@/app/(main)/products/[id]/actions";
import OrderForm from "@/app/(main)/order/[id]/form";
import {createClient} from "@/utils/server";
import {redirect} from "next/navigation";

//오더폼 수정 결제/네이버 주소 api연동
export default async function Page({ params }:{params:Promise<{id:string}>}) {
    const {id} = await params
    const supabase = await createClient()
    const {data:{user}}=await supabase.auth.getUser()
    if(!user) return redirect('/login')
    const {data} = await getOneProduct(id);
    if (!data) {
        return (
            <div className="container mx-auto p-4 text-center">
                <h1 className="text-2xl font-bold mb-6">상품을 찾을 수 없습니다.</h1>
                <p className="mb-4">요청하신 상품 정보를 불러올 수 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="p-4 w-full">
                <h1 className="text-2xl font-bold mb-6 text-center">배송정보</h1>
                <OrderForm product={data} user={user}/>
            </div>
        </div>
    );
}