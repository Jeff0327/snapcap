'use client';
import React from 'react';
import Image from 'next/image';
import {ColorOption, ProductsJson} from '@/types';
import { formatPrice, getDiscountRate } from "@/utils/utils";
import { useRouter, useSearchParams } from 'next/navigation';

export function ProductDetail({ product }: {product: ProductsJson}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // searchParams에서 값 가져오기
    const selectedImageParam = searchParams.get('image');
    const isColorOption = (item: unknown): item is ColorOption => {
        return (
            typeof item === 'object' &&
            item !== null &&
            !Array.isArray(item) &&
            'code' in item &&
            'name' in item &&
            typeof (item as any).code === 'string' &&
            typeof (item as any).name === 'string'
        );
    };
    // 선택된 이미지 결정 (URL 파라미터 또는 첫 번째 이미지)
    const selectedImage = selectedImageParam &&
    product.images?.includes(selectedImageParam)
        ? selectedImageParam
        : product.images?.[0] || '';

    // null 체크를 통한 색상 배열 안전하게 처리
    const colors = React.useMemo(() => {
        if (!Array.isArray(product.colors)) return [];

        return product.colors
            .filter(isColorOption)
            .map(item => ({
                code: item.code,
                name: item.name
            }));
    }, [product.colors]);

    const discountRate = getDiscountRate(product);

    // URL 파라미터 업데이트 함수
    const updateParams = (name: string, value: string | null) => {
        // 현재 URL 매개변수를 기반으로 새 URLSearchParams 객체 생성
        const params = new URLSearchParams(searchParams.toString());

        if (value === null) {
            // 값이 null이면 매개변수 제거
            params.delete(name);
        } else {
            // 매개변수 설정 또는 업데이트
            params.set(name, value);
        }

        // 새 URL로 이동 (히스토리 교체)
        router.replace(`?${params.toString()}`, { scroll: false });
    };

    // 이미지 선택 처리
    const handleImageSelect = (image: string) => {
        updateParams('image', image);
    };

    return (
        <>
            <div className="flex flex-col xl:flex-row gap-12 py-8">
                {/* 이미지 섹션 */}
                <div className="flex flex-col w-full xl:w-3/5">
                    <div className="relative aspect-square overflow-hidden mb-6">
                        {selectedImage ? (
                            <Image
                                src={selectedImage}
                                alt={product.name}
                                fill
                                priority
                                className="object-contain"
                                sizes="(max-width: 1280px) 100vw, 60vw"
                                quality={100}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <span className="text-gray-400">이미지 없음</span>
                            </div>
                        )}
                    </div>

                    {/* 썸네일 이미지 */}
                    {product.images && product.images.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto p-2">
                            {product.images.map((image, index) => (
                                <div
                                    key={index}
                                    className={`relative min-w-[80px] h-[80px] rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                                        selectedImage === image
                                            ? 'ring-2 ring-offset-2 ring-indigo-600 scale-105'
                                            : 'border border-gray-200 hover:border-gray-300'
                                    }`}
                                    onClick={() => handleImageSelect(image)}
                                >
                                    <Image
                                        src={image}
                                        alt={`${product.name} 이미지 ${index + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="80px"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 상품 정보 섹션 */}
                <div className="w-full xl:w-2/5 space-y-8 px-4 lg:px-0">
                    <div>
                        {product.tags && product.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                                {product.tags.slice(0, 3).map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

                        {product.sku && (
                            <p className="text-sm text-gray-500 mt-2">SKU: {product.sku}</p>
                        )}
                    </div>

                    {/* 가격 정보 */}
                    <div className="pt-4 border-t border-gray-100">
                        {discountRate ? (
                            <div className="space-y-1">
                                <div className="flex items-center">
                                    <span className="text-3xl font-bold text-gray-900">
                                        {formatPrice(product.sale_price as number)}
                                    </span>
                                    <span
                                        className="ml-3 text-sm bg-red-50 text-red-600 px-3 py-1 rounded-full font-medium">
                                        {discountRate}% OFF
                                    </span>
                                </div>
                                <p className="text-gray-500 line-through">{formatPrice(product.price)}</p>
                            </div>
                        ) : (
                            <p className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</p>
                        )}

                        {/* 재고 정보 */}
                        <div className="mt-3 flex items-center">
                            {product.inventory > 0 ? (
                                <div className="flex items-center text-green-600">
                                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                                    <span className="text-sm font-medium">재고 있음 ({product.inventory}개)</span>
                                </div>
                            ) : (
                                <div className="flex items-center text-red-600">
                                    <div className="w-2 h-2 bg-red-600 rounded-full mr-2"></div>
                                    <span className="text-sm font-medium">품절</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 색상 옵션 - null 체크와 함께 표시 */}
                    {colors.length > 0 && (
                        <div className="pt-6 border-t border-gray-100">
                            <h3 className="text-sm font-medium text-gray-900 mb-3">색상</h3>
                            <div className="flex flex-wrap gap-3">
                                {colors.map((color, index) => {
                                    // TypeScript null/undefined 체크
                                    if (!color || !color.code) return null;

                                    return (
                                        <div
                                            key={index}
                                            className={`relative w-12 h-12 rounded-full border`}
                                            style={{backgroundColor: color.code}}
                                            title={color.name || ''}
                                        >
                                            <span className="sr-only">{color.name || '색상'}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* 배송 및 서비스 정보 */}
                    <div className="pt-6 border-t border-gray-100">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">배송 및 서비스</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-start">
                                <div className="p-2 bg-indigo-50 rounded-lg mr-3">
                                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M5 13l4 4L19 7"/>
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-900">무료 배송</p>
                                    <p className="text-xs text-gray-500">*일부지역 제외</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="p-2 bg-indigo-50 rounded-lg mr-3">
                                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3"/>
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-900">10일 이내 <br/>무료 반품</p>
                                    <p className="text-xs text-gray-500">빠른 반품 서비스</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="p-2 bg-indigo-50 rounded-lg mr-3">
                                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-900">당일 출고</p>
                                    <p className="text-xs text-gray-500">오전 시간 주문 시</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="p-2 bg-indigo-50 rounded-lg mr-3">
                                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-900">안전 결제</p>
                                    <p className="text-xs text-gray-500">안전한 결제 시스템</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 상품 설명 - 별도 섹션으로 분리 */}
            <div className="mt-8 border-t border-gray-100 pt-8 px-4 lg:px-0">
                <h3 className="text-xl font-bold mb-4">상품 설명</h3>
                <div
                    className="prose prose-sm max-w-none text-gray-600"
                    dangerouslySetInnerHTML={{__html: product.description || '상품 설명이 없습니다.'}}
                />
            </div>
        </>
    );
}