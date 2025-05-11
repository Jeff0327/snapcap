import React from 'react';

import {createClient} from "@/utils/server";
import {redirect} from "next/navigation";
import {getUserOrders} from "@/app/(main)/order/orderList/actions";
import OrderList from "@/components/order/orderList/OrderList";

async function Page() {
    const supabase = await createClient()
    const {data:{user}}=await supabase.auth.getUser()
    if(!user) redirect('/login')
    const orderList = await getUserOrders(user.id)
    if(!orderList ||orderList.length===0) return (
        <div>주문 내역이 없습니다.</div>
    )
    return (
        <div>
            {/*<OrderList orderList={orderList}/>*/}
        </div>
    );
}

export default Page;