import React from 'react';
import {createClient} from "@/utils/server";
import {redirect} from "next/navigation";

async function Page() {
    const supabase = await createClient()
    
    const {data:{user}}= await supabase.auth.getUser()
    
    if(!user) return redirect('/login')
    return (
        <div>주문내역</div>
    );
}

export default Page;