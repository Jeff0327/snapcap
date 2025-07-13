'use client'
import React, { useEffect, useState } from 'react';
import Image from "next/image";

function Banner() {
    const [activeSlide, setActiveSlide] = useState(0);
    const [nextSlide, setNextSlide] = useState<number | null>(null);
    const [transitioning, setTransitioning] = useState(false);

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

    // 이미지 자동 전환
    useEffect(() => {
        if (transitioning) return; // 전환 중이면 타이머 설정 안 함

        const timer = setInterval(() => {
            const next = (activeSlide + 1) % slides.length;
            startTransition(next);
        }, 5000); // 5초마다 슬라이드 변경

        return () => clearInterval(timer); // 컴포넌트 언마운트 시 타이머 정리
    }, [activeSlide, transitioning, slides.length]);

    // 크로스페이드 트랜지션 시작
    const startTransition = (index: number) => {
        setTransitioning(true);
        setNextSlide(index);

        // 전환 애니메이션 후 active 슬라이드 업데이트
        setTimeout(() => {
            setActiveSlide(index);
            setNextSlide(null);
            setTransitioning(false);
        }, 1000); // 페이드 효과가 완료되는데 걸리는 시간
    };

    // Function to handle dot indicator clicks
    const handleDotClick = (index: number) => {
        if (transitioning || index === activeSlide) return;
        startTransition(index);
    };

    return (
        <main>
            <div
                className="w-full h-[40vh] lg:h-[80vh] flex flex-col items-center justify-center bg-white dark:bg-[#121212] relative overflow-hidden">

                {/* 현재 활성화된 슬라이드 */}
                <div className="absolute inset-0">
                    <Image
                        src={slides[activeSlide].image}
                        alt={`Slide ${activeSlide + 1}`}
                        className="object-cover w-full h-full -translate-y-10"
                        width={1920}
                        height={1080}
                        priority
                    />
                    {/* 다크모드 오버레이 */}
                    <div className="absolute inset-0 bg-black/0 dark:bg-black/30 transition-opacity duration-300 -translate-y-10"></div>
                </div>

                {/* 다음 슬라이드 (전환 중에만 표시) */}
                {nextSlide !== null && (
                    <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out opacity-0 animate-fadeIn">
                        <Image
                            src={slides[nextSlide].image}
                            alt={`Next Slide ${nextSlide + 1}`}
                            className="object-cover w-full h-full -translate-y-10"
                            width={1920}
                            height={1080}
                        />
                        {/* 다크모드 오버레이 (다음 슬라이드용) */}
                        <div className="absolute inset-0 bg-black/0 dark:bg-black/30 transition-opacity duration-300 -translate-y-10"></div>
                    </div>
                )}

                {/* Bottom navigation dots */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 z-30 w-full">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => handleDotClick(index)}
                            className={`h-5 rounded-full transition-all duration-300 ${
                                index === (nextSlide !== null ? nextSlide : activeSlide)
                                    ? 'bg-gradient-to-r from-purple-300 to-blue-500 w-[50px]'
                                    : 'bg-gradient-to-b from-purple-200 to-blue-200 hover:bg-gray-300 dark:hover:bg-gray-600 w-5'
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