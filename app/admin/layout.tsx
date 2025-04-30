import React, {ReactNode} from 'react';
import Link from "next/link";
import {GoHome} from "react-icons/go";

function Layout({children}: { children: ReactNode }) {
    return (
        <div>
            <div className={'ml-4 mt-4'}>
                <Link className={'flex flex-row items-center'} href={'/'}><GoHome className={'w-8 h-8 relative'}/><h2
                    className={'font-jalnan text-lg'}>스냅캡</h2></Link>
            </div>
            {children}
        </div>
    );
}

export default Layout;