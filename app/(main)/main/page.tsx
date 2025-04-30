import React from 'react';
import Banner from "@/components/main/Banner";

async function Page() {

    return (
        <div>
            <Banner/>
            <div className={'p-5 lg:p-12'}>
                <h1 className={'text-lg lg:text-2xl font-Nanum'}>BEST</h1>
            </div>
        </div>
    );
}

export default Page;