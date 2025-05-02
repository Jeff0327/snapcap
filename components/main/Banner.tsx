'use client'
import React, { useEffect, useState } from 'react';
import Image from "next/image";

function Banner() {
    const [activeSlide, setActiveSlide] = useState(0);
    const [visible, setVisible] = useState(true);

    const slides = [
        {
            image: "/banner/banner_1.jpg",

        },
        {
            image: "/banner/banner_2.jpg",

        },
        {
            image: "/banner/banner_3.jpg",

        },
        {
            image: "/banner/banner_4.jpg",
        },
        {
            image: "/banner/banner_5.jpg",
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

    // Function to handle dot indicator clicks
    const handleDotClick = (index:number) => {
        setVisible(false);
        setTimeout(() => {
            setActiveSlide(index);
            setVisible(true);
        }, 500);
    };

    return (
        <main>
            <div className="w-full h-[40vh] lg:h-[80vh] flex flex-col items-center justify-center bg-white relative overflow-hidden">
                {/* Background image with dark overlay */}
                <div className={`absolute inset-0 transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
                    <Image
                        src={slides[activeSlide].image}
                        alt={`Slide ${activeSlide + 1}`}
                        className="object-cover w-full h-full -translate-y-10"
                        width={1920}
                        height={1080}
                        priority
                    />
                    <div className="absolute inset-0"></div>
                </div>

                {/* Bottom navigation dots */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 z-30 w-full">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => handleDotClick(index)}
                            className={`w-5 h-5 rounded-full transition-all duration-300 ${
                                index === activeSlide
                                    ? 'bg-gradient-to-r from-purple-300 to-blue-500 w-[50px]'
                                    : 'bg-gradient-to-b from-purple-200 to-blue-200 hover:bg-gray-300'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </main>
    );
}

export default Banner;