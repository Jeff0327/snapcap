'use client'
import React, { useEffect, useState } from 'react';
import { User } from "@supabase/supabase-js"; // 경로 수정
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"; // shadcn/ui 컴포넌트 경로
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

function Banner({ user }: { user: User | null }) {
    const [activeSlide, setActiveSlide] = useState(0);
    const [visible, setVisible] = useState(true);

    const slides = [
        {
            text: "첫 번째 슬라이드의 텍스트입니다.",
            image: "/cap_02.jpg"
        },
        {
            text: "두 번째 슬라이드의 텍스트입니다.",
            image: "/img_01.png"
        },
        {
            text: "세 번째 슬라이드의 텍스트입니다.",
            image: "/img_01.png"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            // 현재 슬라이드를 페이드 아웃
            setVisible(false);

            // 페이드 아웃 후 다음 슬라이드로 전환
            setTimeout(() => {
                setActiveSlide((prev) => (prev + 1) % slides.length);
                setVisible(true);
            }, 500); // 페이드 아웃 효과를 위한 시간 (0.5초)

        }, 5000); // 5초마다 슬라이드 변경

        return () => clearInterval(timer); // 컴포넌트 언마운트 시 타이머 정리
    }, [slides.length]);

    return (
        <main>
            <div className="w-full h-[80vh] flex flex-col items-center justify-center bg-green-100 relative">
                {/* 슬라이드 내용 */}
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
                    <Image
                        src={slides[activeSlide].image}
                        alt={`Slide ${activeSlide + 1}`}
                        className="object-cover w-full h-full"
                        width={1000}
                        height={1000}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                        <h2 className="text-4xl text-white font-bold">{slides[activeSlide].text}</h2>
                    </div>
                </div>

                {/* 사용자 정보 HoverCard (로그인한 경우에만 표시) */}
                {user && (
                    <div className="absolute top-5 right-5 z-10">
                        <HoverCard>
                            <HoverCardTrigger asChild>
                                <button className="flex items-center space-x-2 bg-white bg-opacity-80 rounded-full px-4 py-2 shadow-md transition-all hover:bg-opacity-100">
                                    <Avatar>
                                        <AvatarImage src={user.user_metadata?.avatar_url || ''} />
                                        <AvatarFallback>{user.email?.substring(0, 2).toUpperCase() || 'UN'}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{user.email?.split('@')[0]}</span>
                                </button>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                                <div className="flex justify-between space-x-4">
                                    <Avatar>
                                        <AvatarImage src={user.user_metadata?.avatar_url || ''} />
                                        <AvatarFallback>{user.email?.substring(0, 2).toUpperCase() || 'UN'}</AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-semibold">{user.user_metadata?.full_name || user.email?.split('@')[0]}</h4>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                        <div className="flex items-center pt-2">
                                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">활성 계정</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 border-t pt-4">
                                    <p className="text-xs text-gray-500">
                                        계정 ID: {user.id.substring(0, 8)}...
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        가입일: {new Date(user.created_at || '').toLocaleDateString()}
                                    </p>
                                </div>
                            </HoverCardContent>
                        </HoverCard>
                    </div>
                )}
            </div>
        </main>
    );
}

export default Banner;