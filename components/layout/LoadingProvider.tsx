'use client';
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Loading from "@/components/layout/Loading";


interface LoadingContextType {
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

export const LoadingProvider: React.FC<LoadingProviderProps> = ({
                                                                    children,
                                                                    defaultImages
                                                                }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [images, setImages] = useState<string[] | undefined>(defaultImages);

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
        showLoading,
        hideLoading,
        setLoadingImages
    };

    return (
        <LoadingContext.Provider value={value}>
            {children}
            <Loading isLoading={isLoading} images={images} />
        </LoadingContext.Provider>
    );
};