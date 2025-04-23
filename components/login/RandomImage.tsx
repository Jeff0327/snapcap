'use client'
import React, { useEffect, useState } from 'react';
import Image from "next/image";

function RandomImage() {
    const [currentImage, setCurrentImage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    // 랜덤 이미지 배열
    const images = [
        '/login/loginBackground0.jpg',
        '/login/loginBackground1.jpg',
        '/login/loginBackground2.jpg',
        '/login/loginBackground3.jpg',
        '/login/loginBackground4.jpg',
        '/login/loginBackground5.jpg',
        '/login/loginBackground6.jpg',
        '/login/loginBackground7.jpg',
    ];

    // 컴포넌트 마운트 확인
    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    // 이미지 선택 및 로드
    useEffect(() => {
        if (isMounted) {
            const randomIndex = Math.floor(Math.random() * images.length);
            setCurrentImage(images[randomIndex]);
        }
    }, [isMounted]);

    // 이미지가 없을 경우 보여줄 로딩 컴포넌트
    if (!isMounted || !currentImage) {
        return (
            <div className="hidden md:flex justify-center items-center h-full bg-gray-100 relative">
                <div className="animate-pulse bg-gray-200 w-full h-full"></div>
            </div>
        );
    }

    return (
        <div className={'hidden md:flex justify-center items-center h-full relative overflow-hidden'}>
            {isLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse z-10"></div>
            )}
            <Image
                src={currentImage}
                alt={'login background'}
                fill
                priority
                style={{ objectFit: 'cover' }}
                className={`transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoadingComplete={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
            />
        </div>
    );
}

export default RandomImage;