'use client'
import React from 'react';
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { FaUserCircle } from "react-icons/fa";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { CgMenuRightAlt } from "react-icons/cg";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Avatar,
    AvatarImage,
    AvatarFallback
} from "@/components/ui/avatar";
import { signOut } from "@/app/(main)/login/actions";
import { IoSearchOutline } from "react-icons/io5";
import { PiUserLight } from "react-icons/pi";
function UserInfo({ user }: { user: User | null }) {
    // 사용자 이니셜 생성 함수
    const getUserInitials = () => {
        if (!user || !user.email) return "U";
        return user.email.charAt(0).toUpperCase();
    };

    return (
        <>
            {user ? (
                <div className="flex items-center space-x-3.5">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Avatar className="cursor-pointer h-8 w-8">
                                {user.user_metadata?.avatar_url ? (
                                    <AvatarImage
                                        src={user.user_metadata.avatar_url}
                                        alt={user.email || "사용자"}
                                    />
                                ) : null}
                                <AvatarFallback>
                                    {getUserInitials()}
                                </AvatarFallback>
                            </Avatar>
                        </PopoverTrigger>
                        <PopoverContent className="w-60 backdrop-blur">
                            <div className="flex flex-col items-center space-y-2 p-2">
                                <Avatar className="h-12 w-12 mb-2">
                                    {user.user_metadata?.avatar_url ? (
                                        <AvatarImage
                                            src={user.user_metadata.avatar_url}
                                            alt={user.email || "사용자"}
                                        />
                                    ) : null}
                                    <AvatarFallback className="text-lg">
                                        {getUserInitials()}
                                    </AvatarFallback>
                                </Avatar>
                                <h2 className="text-sm lg:text-md font-semibold">
                                    {user.email}
                                </h2>
                                <div className="flex gap-2 w-full mt-2">
                                    <Link href="/profile" className="flex-1">
                                        <Button variant="outline" className="w-full text-xs bg-white">
                                            내 정보
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="destructive"
                                        onClick={signOut}
                                        className="flex-1 text-xs bg-black text-white"
                                    >
                                        로그아웃
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <button><IoSearchOutline className={'w-7 h-7'}/></button>
                    <Link href="/shipping">
                        <ShoppingBag className="w-5 h-5"/>
                        <span className="sr-only">장바구니</span>
                    </Link>

                    <Link href="/menu">
                        <CgMenuRightAlt className="w-5 h-5"/>
                        <span className="sr-only">세팅</span>
                    </Link>

                    {user.user_metadata.role === 'admin' && (
                        <Link href="/admin" className="text-sm font-medium text-blue-600 hover:underline">
                            관리자
                        </Link>
                    )}
                </div>
            ) : (
                <div className="flex items-center space-x-2">
                    <button><IoSearchOutline className={'w-7 h-7'}/></button>
                    <Link href="/login">
                            <PiUserLight  className="w-7 h-7"/>
                    </Link>
                </div>
            )}
        </>
    );
}

export default UserInfo;