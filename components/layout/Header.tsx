'use client'
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import {User} from "@supabase/supabase-js";
import UserInfo from "@/components/layout/RightMenu";
import {usePathname} from "next/navigation";
import {Button} from "@/components/ui/button";

interface HeaderProps {
    user: User | null;
    cartItemsCount?: number; // 장바구니 아이템 개수 추가
}
function Header({ user, cartItemsCount = 0 }: HeaderProps) {
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname()

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
                ? 'border-b backdrop-blur-sm bg-gradient-to-r bg-white/50 dark:bg-[#121212]'
                : ''
        }`}>
            <div className="container flex items-center justify-between h-16 px-4 mx-auto">
                <Link href="/" className={`text-2xl font-GongGothic text-black dark:text-white`}>
                    SNAPCAP
                </Link>
                <div className={'text-black'}>
                    <UserInfo user={user} cartItemsCount={cartItemsCount} />
                </div>
            </div>
        </header>
    );
}

export default Header;