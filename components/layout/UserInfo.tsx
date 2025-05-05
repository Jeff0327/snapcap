'use client'
import React, { useRef, useState } from 'react';
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { MdAdminPanelSettings } from "react-icons/md";
import { ShoppingBag, X } from "lucide-react";
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
import { FaRegUserCircle } from "react-icons/fa";
import FormContainer, {FormState} from "@/components/ui/form";
import {searchProduct} from "@/app/(main)/main/actions";
import {ERROR_CODES} from "@/utils/ErrorMessage";
import {useRouter} from "next/navigation";
import useAlert from "@/lib/notiflix/useAlert";

function UserInfo({ user }: { user: User | null }) {
    const [searchOpen, setSearchOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter()
    const {notify} =useAlert()
    // 사용자 이니셜 생성 함수
    const getUserInitials = () => {
        if (!user || !user.email) return <FaRegUserCircle className={'w-6 h-6'}/>;
        return user.email.charAt(0).toUpperCase();
    };

    // 검색 열기 핸들러
    const handleOpenSearch = () => {
        setSearchOpen(true);
        // 입력 필드에 자동으로 포커스
        setTimeout(() => {
            searchInputRef.current?.focus();
        }, 100);
    };

    // 검색 닫기 핸들러
    const handleCloseSearch = () => {
        setSearchOpen(false);
        // 검색어 초기화
        if (searchInputRef.current) {
            searchInputRef.current.value = '';
        }
    };

    // 검색 결과 처리 핸들러
    const handleSearchResult = (formState:FormState) => {
        if(formState.code===ERROR_CODES.SUCCESS){
            router.push(`${formState.redirect}`)
        }else{
                notify.info(`${formState.message}`)
        }
        // 검색 완료 후 검색창 닫기
        setSearchOpen(false);
    };

    return (
        <>
            {/*비로그인과 로그인 유저를 구분지을 필요없음 page컴포넌트에서 user===null 이면 login페이지로 리다이렉트 처리*/}
            {user ? (
                <div className="flex items-center space-x-3.5 relative">
                    {/* 검색 오버레이 */}
                    <div
                        className={`absolute right-0 flex items-center transition-all duration-300 ease-in-out bg-white/90 backdrop-blur-sm rounded-full border ${
                            searchOpen
                                ? 'w-64 opacity-100 pointer-events-auto'
                                : 'w-0 opacity-0 pointer-events-none'
                        }`}
                    >
                        <FormContainer
                            action={searchProduct}
                            onResult={handleSearchResult}
                        >
                            <div className="flex w-full px-3 py-1">
                                <input
                                    ref={searchInputRef}
                                    name="searchTerm"
                                    type="text"
                                    placeholder="상품 검색..."
                                    className="w-full bg-transparent border-none outline-none px-2 text-black"
                                    required
                                />
                                <button type="button" onClick={handleCloseSearch}>
                                    <X className="h-4 w-4 text-gray-500" />
                                </button>
                            </div>
                        </FormContainer>
                    </div>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Avatar className={`cursor-pointer w-6 h-6 ${searchOpen && '-z-10'}`}>
                                {user.user_metadata?.avatar_url && (
                                    <AvatarImage
                                        src={user.user_metadata.avatar_url}
                                        alt={user.email || "사용자"}
                                    />
                                )}
                                <AvatarFallback>
                                    <div className={'flex justify-center items-center w-7 h-7 rounded-full bg-white'}>
                                        <h2 className={'text-lg text-black  '}>
                                            {getUserInitials()}
                                        </h2>
                                    </div>
                                </AvatarFallback>
                            </Avatar>
                        </PopoverTrigger>
                        <PopoverContent className="w-60 backdrop-blur">
                            <div className="flex flex-col items-center space-y-2 p-2">
                                <Avatar className="h-10 w-10 mb-2">
                                    {user.user_metadata?.avatar_url && (
                                        <AvatarImage
                                            src={user.user_metadata.avatar_url}
                                            alt={user.email || "사용자"}
                                        />
                                    ) }
                                    <AvatarFallback className="text-lg rounded-full bg-white">
                                        {getUserInitials()}
                                    </AvatarFallback>
                                </Avatar>
                                <h2 className="text-sm lg:text-md font-semibold bg-white px-4 py-2 rounded-lg">
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

                    <button onClick={handleOpenSearch}>
                        <IoSearchOutline className={'w-6 h-6'}/>
                        <span className="sr-only">검색</span>
                    </button>

                    <Link href="/shipping">
                        <ShoppingBag className="w-5 h-5"/>
                        <span className="sr-only">장바구니</span>
                    </Link>

                    <Link href="/menu">
                        <CgMenuRightAlt className="w-6 h-6"/>
                        <span className="sr-only">메뉴</span>
                    </Link>

                    {user.user_metadata.role === 'admin' && (
                        <Link href="/admin">
                            <MdAdminPanelSettings className={'w-6 h-6'}/>
                        </Link>
                    )}
                </div>
            ) : (
                <div className="flex items-center space-x-2 relative">
                    {/* 검색 오버레이 (비로그인 상태) */}
                    <div
                        className={`absolute right-0 flex items-center transition-all duration-300 ease-in-out bg-white/90 backdrop-blur-sm rounded-full border ${
                            searchOpen
                                ? 'w-64 opacity-100 pointer-events-auto'
                                : 'w-0 opacity-0 pointer-events-none'
                        }`}
                    >
                        <FormContainer
                            action={searchProduct}
                            onResult={handleSearchResult}
                        >
                            <div className="flex w-full px-3 py-1">
                                <input
                                    ref={searchInputRef}
                                    name="searchTerm"
                                    type="text"
                                    placeholder="상품 검색..."
                                    className="w-full bg-transparent border-none outline-none px-2 text-black"
                                    required
                                />
                                <button type="button" onClick={handleCloseSearch}>
                                    <X className="h-4 w-4 text-gray-500" />
                                </button>
                            </div>
                        </FormContainer>
                    </div>

                    <button onClick={handleOpenSearch}>
                        <IoSearchOutline className={'w-7 h-7'}/>
                    </button>

                    <Link href="/login">
                        <PiUserLight className="w-7 h-7"/>
                    </Link>
                </div>
            )}
        </>
    );
}

export default UserInfo;