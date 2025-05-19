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
            <div className={'flex mt-2 mx-2 gap-3'}>
                {/* Sidebar Navigation */}
                <div className={'flex flex-col items-center p-2 border w-[20vw] h-[90vh] rounded-lg'}>
                    <Link href={'/admin/dashboard'} className={'py-2'}>대쉬보드</Link>
                    <Link href={'/admin/users'} className={'py-2'}>회원관리</Link>
                    <Link href={'/admin/products'} className={'py-2'}>상품관리</Link>
                    <Link href={'/admin/orders'} className={'py-2'}>주문관리</Link>
                </div>
                <div className={'flex-1'}>
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Layout;