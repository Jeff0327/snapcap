'use client'
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import {User} from "@supabase/supabase-js";
import UserInfo from "@/components/layout/UserInfo";

interface HeaderProps {
    user: User | null;
    cartItemsCount?: number; // 장바구니 아이템 개수 추가
}
function Header({ user, cartItemsCount = 0 }: HeaderProps) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 10;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [scrolled]);

    return (
        <header className={`fixed top-0 w-full z-10 ${
            scrolled
                ? 'border-b backdrop-blur-md bg-white/30'
                : ''
        }`}>
            <div className="container flex items-center justify-between h-16 px-4 mx-auto">
                <Link href="/" className={`text-2xl font-Nanum text-black`}>
                    스냅캡
                </Link>
                <div className={'text-black'}>
                    <UserInfo user={user} cartItemsCount={cartItemsCount} />
                </div>
            </div>
        </header>
    );
}

export default Header;