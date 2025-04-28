'use client'
import React from 'react';
import {User} from "@supabase/supabase-js";
import {Button} from "@/components/ui/button";
import {FaUserCircle} from "react-icons/fa";
import {ShoppingBag} from "lucide-react";
import Link from "next/link";
import { CgMenuRightAlt } from "react-icons/cg";
import {

    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

function UserInfo({user}:{user:User | null}) {

    return (
        <>
            {user ?
                <div className="flex items-center space-x-3.5">
                    <Popover>
                    <PopoverTrigger asChild={true}>
                        <div>
                            <FaUserCircle className="w-5 h-5"/>
                            <span className="sr-only">유저정보</span>
                        </div>
                    </PopoverTrigger>
                    <PopoverContent asChild={true}>
                        <div className={'bg-white text-center'}>
                            <h2 className={'text-sm lg:text-lg font-semibold'}>{user.email}님 환영합니다.</h2>
                            <span className={'text-sm lg:text-lg'}>내정보</span>
                        </div>

                        </PopoverContent>
                </Popover>
                    <Link href={'/shipping'}>
                        <ShoppingBag className="w-5 h-5"/>
                        <span className="sr-only">장바구니</span>
                    </Link>
                    <Link href={'/menu'}>
                        <CgMenuRightAlt className={'w-5 h-5'}/>
                        <span className="sr-only">세팅</span>
                    </Link>
                    {user.user_metadata.role==='admin' && <Link href={'/admin'}>관리자</Link>}
                </div> :
                <div className="flex items-center space-x-2">
                    <Link href="/login">
                        <Button variant="ghost" size="icon" aria-label="로그인">
                            <FaUserCircle className="w-6 h-6"/>
                            <span className="sr-only">로그인</span>
                        </Button>
                    </Link>
                </div>}
        </>

    );
}

export default UserInfo;