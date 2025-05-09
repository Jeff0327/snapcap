import React from 'react';
import {createClient} from "@/utils/server";
import {redirect} from "next/navigation";

async function Page({params}:{params:Promise<{id:string}>}) {
    const {id} = await params;
    const supabase = await createClient()
    const {data:{user}} = await supabase.auth.getUser()
    if(!user) return redirect('/login')
    if(!id) return <div>결제정보를 찾을 수 없습니다.</div>
    // const paymentProduct = await getPaymentProduct(id)
    return (
        <></>
    );
}

export default Page;