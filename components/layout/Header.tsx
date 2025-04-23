import React from 'react';
import Link from "next/link";
import { ChevronRight, ShoppingBag } from "lucide-react"
import { FaUserCircle } from "react-icons/fa"; // react-icons에서 사용자 아이콘 가져오기
import { Button } from "@/components/ui/button";

function Header() {
    return (
        <header className="sticky top-0 z-10 bg-white border-b">
            <div className="container flex items-center justify-between h-16 px-4 mx-auto">
                <Link href="/" className="text-2xl font-Nanum">
                    스냅캡
                </Link>
                <nav className="hidden space-x-6 md:flex">

                </nav>
                <div className="flex items-center space-x-2">
                    <Link href="/login">
                        <Button variant="ghost" size="icon" aria-label="로그인">
                            <FaUserCircle className="w-6 h-6" />
                            <span className="sr-only">로그인</span>
                        </Button>
                    </Link>
                    <Button variant="ghost" size="icon">
                        <ShoppingBag className="w-7 h-7"/>
                        <span className="sr-only">장바구니</span>
                    </Button>
                </div>
            </div>
        </header>
    );
}

export default Header;