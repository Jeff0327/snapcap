import React from 'react';
import {createClient} from "@/utils/server";
import {redirect} from "next/navigation";
import UserInfoCard from "@/components/profile/UserInfo";

async function Page() {
    const supabase = await createClient()

    const {data:{user}} =await supabase.auth.getUser()

    if(!user) return redirect('/login')
    return (
        <div><UserInfoCard user={user}/></div>
    );
}

export default Page;