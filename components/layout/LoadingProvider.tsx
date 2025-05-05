'use client';
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Loading from "@/components/layout/Loading";

interface LoadingContextType {
    isLoading: boolean;
    images: string[]; // 이미지 배열 타입 추가 (undefined가 아닌 string[])
    showLoading: () => void;
    hideLoading: () => void;
    setLoadingImages: (images: string[]) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = (): LoadingContextType => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
};

interface LoadingProviderProps {
    children: ReactNode;
    defaultImages?: string[];
}

// 기본 이미지 배열 정의
const DEFAULT_IMAGES = [
    '/loading/cap_01.png',
    '/loading/cap_02.jpg',
    '/loading/cap_03.jpg',
];

export const LoadingProvider: React.FC<LoadingProviderProps> = ({
                                                                    children,
                                                                    defaultImages = DEFAULT_IMAGES // 기본값 설정
                                                                }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [images, setImages] = useState<string[]>(defaultImages); // undefined가 아닌 string[] 타입으로

    const showLoading = useCallback(() => {
        setIsLoading(true);
    }, []);

    const hideLoading = useCallback(() => {
        setIsLoading(false);
    }, []);

    const setLoadingImages = useCallback((newImages: string[]) => {
        setImages(newImages);
    }, []);

    const value = {
        isLoading,
        images, // 이미지 배열 전달
        showLoading,
        hideLoading,
        setLoadingImages
    };

    return (
        <LoadingContext.Provider value={value}>
            {children}
            <Loading />
        </LoadingContext.Provider>
    );
};