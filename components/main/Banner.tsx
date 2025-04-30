'use client'
import React, { useEffect, useState } from 'react';
import { User } from "@supabase/supabase-js";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

function Banner() {
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
            <div className="w-full h-[40vh] lg:h-[80vh] flex flex-col items-center justify-center bg-green-100 relative">
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
            </div>
        </main>
    );
}

export default Banner;