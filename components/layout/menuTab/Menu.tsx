import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import React, {useEffect, useState} from 'react';
import {MdAdminPanelSettings} from "react-icons/md";
import {CgMenuRightAlt} from "react-icons/cg";
import Link from "next/link";
import {User} from "@supabase/supabase-js";
import {signOut} from "@/app/(main)/login/actions";
import {usePathname, useRouter} from "next/navigation";
import {Badge} from "@/components/ui/badge";
import { HiBell } from "react-icons/hi2";
interface MenuProps {
    user: User | null;
    orderCount?: number; // 주문 개수 추가
}
function Menu({user, orderCount = 0}: MenuProps) {
    const [isOpen,setIsOpen]=useState(false);
    const router = useRouter();
    const pathname= usePathname();
    const handleLoginStatus=async()=>{
        if(user){
            await signOut()
            router.push('/main')
        }else{
            router.push('/login')
        }
        setIsOpen(false);
    }
    const handleShppoing=(type:string)=>{
        router.push(`/products?searchType=${type}`);
        setIsOpen(false)
    }
    useEffect(()=>{
        setIsOpen(false)
    },[pathname])
    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <button onClick={()=>setIsOpen(true)} className="focus:outline-none text-black dark:text-white">
                    <CgMenuRightAlt className="w-6 h-6"/>
                    <span className="sr-only">메뉴</span>
                </button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 bg-white shadow-lg border-l transition-transform duration-300 ease-in-out">
                <div className="flex flex-col h-full">
                    {/* 헤더 영역 */}
                    <SheetTitle>
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-jalnan">메뉴</h2>
                    </div>
                    </SheetTitle>
                    {/* 메뉴 아이템 영역 */}
                    <div className="flex-1 overflow-auto p-6">
                        <nav className="space-y-6">
                            {/* 주요 메뉴 */}
                            <div className="space-y-2">
                                <h3 className="text-sm font-GongGothic text-gray-500">쇼핑하기</h3>
                                <div className="space-y-1">
                                    <button onClick={()=>handleShppoing('default')}
                                          className="w-full text-start block py-2 px-3 text-md lg:text-base font-GongGothic hover:bg-gray-100 rounded-md transition-colors">
                                        전체 상품
                                    </button>
                                    <button onClick={() => handleShppoing('new')}
                                            className="w-full text-start block py-2 px-3 text-md lg:text-base font-GongGothic hover:bg-gray-100 rounded-md transition-colors">
                                        신상품
                                    </button>
                                    <button onClick={() => handleShppoing('best')}
                                            className="w-full text-start block py-2 px-3 text-md lg:text-base font-GongGothic hover:bg-gray-100 rounded-md transition-colors">
                                        인기 상품
                                    </button>
                                </div>
                            </div>

                            {/* 사용자 계정 */}
                            <div className="space-y-2">
                                <h3 className="text-sm font-GongGothic text-gray-500">계정</h3>
                                <div className="space-y-1">
                                    <Link href="/profile"
                                          className="block py-2 px-3 text-md lg:text-base font-GongGothic hover:bg-gray-100 rounded-md transition-colors">
                                        내 정보
                                    </Link>
                                    <Link href="/order/complete"
                                          className="block py-2 px-3 text-md lg:text-base font-GongGothic hover:bg-gray-100 rounded-md transition-colors">
                                        주문 내역
                                        {user && orderCount > 0 && (
                                            <Badge variant="secondary"
                                                   className="rounded-full items-center ml-3 relative bg-red-500 text-black">
                                                <HiBell/>{orderCount > 99 ? '99+' : orderCount}
                                            </Badge>

                                        )}

                                    </Link>
                                    <Link href="/cart"
                                          className="block py-2 px-3 text-md lg:text-base font-GongGothic hover:bg-gray-100 rounded-md transition-colors">
                                        장바구니
                                    </Link>
                                </div>
                            </div>

                            {/* 고객 서비스 */}
                            <div className="space-y-2">
                                <h3 className="text-sm font-GongGothic text-gray-500">고객 서비스</h3>
                                <div className="space-y-1">
                                    <Link href="/contact"
                                          className="block py-2 px-3 text-md lg:text-base font-GongGothic hover:bg-gray-100 rounded-md transition-colors">
                                        고객 센터
                                    </Link>
                                </div>
                            </div>


                        </nav>
                        <div className="flex flex-col space-y-3">
                            {user && user.user_metadata.role === 'admin' && (
                                <Link
                                    href="/admin/dashboard"
                                    className="flex items-center py-2 px-3 text-sm lg:text-lg font-GongGothic text-black bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                                >
                                    <MdAdminPanelSettings className="w-5 h-5 mr-2"/>
                                    관리자 페이지
                                </Link>
                            )}
                            <button
                                onClick={()=>handleLoginStatus()}
                                className="py-2 px-3 text-sm lg:text-lg font-GongGothic text-white bg-black hover:bg-gray-800 rounded-md transition-colors"
                            >
                                {user ? "로그아웃" : "로그인"}
                            </button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

export default Menu;