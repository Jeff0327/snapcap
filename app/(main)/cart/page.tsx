import React from 'react';
import {createClient} from "@/utils/server";
import {redirect} from "next/navigation";
import {CartList} from "@/components/main/cart/CartList";
import {getCartItems} from "@/app/(main)/cart/actions";

async function Page() {
    const supabase = await createClient()
    const {data:{user}}=await supabase.auth.getUser()
    if(!user) return redirect('/login')
    const cartItems = await getCartItems(user.id);

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            <CartList initialCartItems={cartItems} />
        </div>
    );
}

export default Page;