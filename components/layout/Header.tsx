import React from 'react';
import Link from "next/link";
import {User} from "@supabase/supabase-js";
import UserInfo from "@/components/layout/UserInfo";

function Header({user}:{user:User|null}) {

    return (
        <header className="sticky top-0 z-10 bg-white border-b">
            <div className="container flex items-center justify-between h-16 px-4 mx-auto">
                <Link href="/" className="text-2xl font-Nanum">
                    스냅캡
                </Link>
                <nav className="hidden space-x-6 md:flex">

                </nav>
                <UserInfo user={user}/>
            </div>
        </header>
    );
}

export default Header;