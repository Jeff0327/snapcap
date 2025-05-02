'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { createPortal } from 'react-dom';

interface LoadingProps {
    isLoading: boolean;
    images?: string[]; // 사용자 정의 이미지 배열(선택 사항)
}

const LoadingComponent: React.FC<LoadingProps> = ({ isLoading, images }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [mounted, setMounted] = useState(false);

    // 기본 이미지 또는 사용자 정의 이미지 사용
    const loadingImages = useMemo(() => {
        return images || [
            '/loading/cap_01.png',
            '/loading/cap_02.jpg',
            '/loading/cap_03.jpg',
        ];
    }, [images]);

    // 이미지 사전 로딩 함수
    useEffect(() => {
        // 성능 최적화: 브라우저 환경에서만 실행
        if (typeof window === 'undefined') return;

        // 이미지 사전 로딩
        const preloadImages = () => {
            loadingImages.forEach((src) => {
                // HTMLImageElement를 사용하여 타입스크립트 호환성 문제 해결
                const imgElement = document.createElement('img');
                imgElement.src = src;
            });
        };

        preloadImages();
        setMounted(true);

        return () => {
            // 클린업 함수
            setMounted(false);
        };
    }, [loadingImages]);

    // 이미지 순환 타이머
    useEffect(() => {
        // 성능 최적화: isLoading이 false면 타이머 설정 안 함
        if (!isLoading || !mounted) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) =>
                prevIndex === loadingImages.length - 1 ? 0 : prevIndex + 1
            );
        }, 500); // 0.5초마다 이미지 변경

        return () => {
            clearInterval(interval);
        };
    }, [isLoading, loadingImages.length, mounted]);

    // 성능 최적화: isLoading이 false면 아무것도 렌더링하지 않음
    if (!isLoading || !mounted) return null;

    // 포털 사용하여 DOM의 최상위에 로딩 컴포넌트 렌더링
    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
            <div className="flex flex-col items-center p-6">
                <div className="relative w-24 h-24 md:w-32 md:h-32">
                    {/* 성능 최적화: 현재 이미지만 렌더링 */}
                    <Image
                        src={loadingImages[currentImageIndex]}
                        alt="로딩 중"
                        fill
                        priority
                        quality={80}
                        className="object-contain rounded-full bg-white"
                        sizes="(max-width: 768px) 96px, 128px"
                    />
                </div>
                <p className="mt-4 text-white font-medium">로딩중</p>
            </div>
        </div>,
        document.body
    );
};

export default LoadingComponent;