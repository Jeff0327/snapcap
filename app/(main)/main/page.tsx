import React from 'react';
import Banner from "@/components/main/Banner";

import {supabase} from "@/utils/supabase";

async function Page() {
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div>
           <Banner user={user}/>
            <div className={'p-12'}>
                <h1 className={'text-2xl font-Nanum'}>BEST</h1>

            </div>
        </div>
    );
}

export default Page;