'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { useLoading } from '@/components/layout/LoadingProvider';

const Loading: React.FC = () => {
    const { isLoading, images } = useLoading(); // 컨텍스트에서 images 사용
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [mounted, setMounted] = useState(false);

    // 컴포넌트 마운트 여부 확인
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // 이미지 순환 타이머
    useEffect(() => {
        if (!isLoading || !mounted || images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) =>
                prev === images.length - 1 ? 0 : prev + 1
            );
        }, 500);

        return () => clearInterval(interval);
    }, [isLoading, images.length, mounted]);

    // 로딩 중이 아니거나 마운트되지 않은 경우 렌더링하지 않음
    if (!isLoading || !mounted) return null;

    // 포털을 사용하여 DOM의 최상위에 렌더링
    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
            <div className="flex flex-col items-center p-6">
                <div className="relative w-24 h-24 md:w-32 md:h-32">
                    <Image
                        src={images[currentImageIndex]}
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

export default Loading;