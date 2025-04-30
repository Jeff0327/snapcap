import React, {ReactNode} from 'react';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {createClient} from "@/utils/server";

async function Layout({children}:{children:ReactNode}) {

    const supabase = await createClient()
    const {data:{user}}=await supabase.auth.getUser();

    return (
        <div>
            <Header user={user}/>
            {children}
            <Footer/>
        </div>
    );
}

export default Layout;