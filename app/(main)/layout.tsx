import React, {ReactNode} from 'react';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {createClient} from "@/utils/server";
import {getCartItemsCount} from "@/app/(main)/cart/actions";
import { Analytics } from "@vercel/analytics/next"
import {getOrderCount} from "@/app/(main)/order/complete/actions";
async function Layout({children}:{children:ReactNode}) {

    const supabase = await createClient()
    const {data:{user}}=await supabase.auth.getUser();

    const cartItemsCount = user ? await getCartItemsCount(user.id) : 0;
    const orderCount = user ? await getOrderCount(user.id) : 0;
    return (
        <div className={'bg-white dark:bg-[#121212] dark:text-white'}>
            <Header user={user} cartItemsCount={cartItemsCount} orderCount={orderCount}/>
            {children}
            <Analytics/>
            <Footer/>
        </div>
    );
}

export default Layout;