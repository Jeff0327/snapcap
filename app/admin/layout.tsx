import React, {ReactNode} from 'react';
import Link from "next/link";
import {GoHome} from "react-icons/go";
import { MdSpaceDashboard } from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { FaHatCowboy } from "react-icons/fa6";
import { FaBoxOpen } from "react-icons/fa";
function Layout({children}: { children: ReactNode }) {
    return (
        <div>
            <div className={'ml-4 mt-4'}>
                <Link className={'flex flex-row items-center'} href={'/'}><GoHome className={'w-8 h-8 relative'}/><h2
                    className={'font-jalnan text-lg'}>스냅캡</h2></Link>
            </div>
            <div className={'flex mt-2 mx-2 gap-3'}>
                {/* Sidebar Navigation */}
                <div className={'flex flex-col font-GongGothic items-center p-2 border w-[20vw] h-[90vh] rounded-lg'}>
                    <Link href={'/admin/dashboard'} className={'flex flex-row items-center gap-2 py-2'}><MdSpaceDashboard className={'w-5 h-5'}/>대쉬보드</Link>
                    <Link href={'/admin/users'} className={'flex flex-row items-center gap-2 py-2'}><FaUsers className={'w-5 h-5'}/>회원관리</Link>
                    <Link href={'/admin/products'} className={'flex flex-row items-center gap-2 py-2'}><FaHatCowboy className={'w-5 h-5'}/>상품관리</Link>
                    <Link href={'/admin/orders'} className={'flex flex-row items-center gap-2 py-2'}><FaBoxOpen className={'w-5 h-5'}/>주문관리</Link>
                </div>
                <div className={'flex-1'}>
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Layout;