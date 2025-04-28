import React from 'react';
import Banner from "@/components/main/Banner";
import {createClient} from "@/utils/server";

async function Page() {

    return (
        <div>
            <Banner/>
            <div className={'p-12'}>
                <h1 className={'text-2xl font-Nanum'}>BEST</h1>
            </div>
        </div>
    );
}

export default Page;