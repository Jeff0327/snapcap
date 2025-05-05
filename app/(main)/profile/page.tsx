import React from 'react';
import {createClient} from "@/utils/server";
import {redirect} from "next/navigation";

async function Page() {
    const supabase = await createClient()

    const {data:{user}} =await supabase.auth.getUser()

    if(!user) return redirect('/login')
    return (
        <div>유저정보</div>
    );
}

export default Page;