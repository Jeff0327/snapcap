import React, {ReactNode} from 'react';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {createClient} from "@/utils/server";
import {getCartItemsCount} from "@/app/(main)/cart/actions";

async function Layout({children}:{children:ReactNode}) {

    const supabase = await createClient()
    const {data:{user}}=await supabase.auth.getUser();

    const cartItemsCount = user ? await getCartItemsCount(user.id) : 0;
    return (
        <div>
            <Header user={user} cartItemsCount={cartItemsCount}/>
            {children}
            <Footer/>
        </div>
    );
}

export default Layout;