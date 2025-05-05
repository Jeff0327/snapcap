'use client';
import { create } from 'zustand';

interface LoadingState {
    isLoading: boolean;
    images: string[];
    message: string | null;
    showLoading: (message?: string) => void;
    hideLoading: () => void;
    setLoadingImages: (images: string[]) => void;
}

// 기본 이미지
const DEFAULT_IMAGES = [
    '/loading/cap_01.png',
    '/loading/cap_02.jpg',
    '/loading/cap_03.jpg',
];

export const useGlobalLoading = create<LoadingState>((set) => ({
    isLoading: false,
    images: DEFAULT_IMAGES,
    message: null,

    showLoading: (message) => set({
        isLoading: true,
        message
    }),

    hideLoading: () => set({
        isLoading: false,
        message: null
    }),

    setLoadingImages: (images) => set({
        images: images.length > 0 ? images : DEFAULT_IMAGES
    }),
}));