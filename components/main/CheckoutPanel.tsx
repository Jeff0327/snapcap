// 모바일 최적화된 CheckoutPanel 컴포넌트

'use client';
import React, { useState, useEffect } from 'react';
import { ProductsJson } from '@/types';
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { ERROR_CODES } from "@/utils/ErrorMessage";
import useAlert from "@/lib/notiflix/useAlert";
import {addToCart} from "@/app/(main)/products/[id]/actions";
import {useLoading} from "@/components/layout/LoadingProvider";

interface CheckoutPanelProps {
    product: ProductsJson;
    user: User | null;
    className?: string; // 🎯 추가: 외부에서 스타일 제어
}

export function CheckoutPanel({ product, user, className = "" }: CheckoutPanelProps) {
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
    const router = useRouter();
    const { notify } = useAlert();
    const {showLoading, hideLoading, isLoading} = useLoading();

    // 가격 포맷팅 함수
    const formatPrice = (price: number | null) => {
        if (price === null) return '-';
        return new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'KRW',
            maximumFractionDigits: 0
        }).format(Number(price));
    };

    // 총 가격 계산
    const getTotalPrice = () => {
        const unitPrice = product.sale_price || product.price;
        return unitPrice * quantity;
    };

    // 🎯 Variant 존재 여부 확인 (타입 안전하게)
    const hasVariants = !!(product as any)?.variants &&
        Array.isArray((product as any).variants) &&
        (product as any).variants.length > 0;

    const productVariants = hasVariants ? (product as any).variants : [];

    // 🎯 전체 상품 품절 여부 - variants 기준으로 확인
    const isProductOutOfStock = hasVariants
        ? !productVariants.some((v: any) => (v.inventory || 0) > 0 && (v.is_active === true))
        : (product.inventory || 0) <= 0;

    // 🎯 첫 번째 사용 가능한 variant 자동 선택 (선택사항)
    useEffect(() => {
        if (hasVariants && !selectedVariant) {
            const firstAvailableVariant = productVariants.find((v: any) =>
                (v.is_active === true) && (v.inventory || 0) > 0
            );
            if (firstAvailableVariant) {
                setSelectedVariant(firstAvailableVariant);
            }
        }
    }, [productVariants, hasVariants, selectedVariant]);

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const increaseQuantity = () => {
        // 🎯 선택된 variant의 재고 기준으로 수량 제한
        const maxInventory = hasVariants && selectedVariant
            ? (selectedVariant.inventory || 0)
            : (product.inventory || 0);

        if (quantity < maxInventory) {
            setQuantity(quantity + 1);
        }
    };

    const handleOrder = async() => {
        if (!user) return router.push('/login');

        const formState = await addToCart({
            productId: product.id,
            quantity: quantity,
            variantId: selectedVariant?.id,
            colorName: selectedVariant?.color,
            colorCode: selectedVariant?.color_code,
            userId: user.id
        });
        if (formState.code === ERROR_CODES.SUCCESS) {
            router.push('/cart')
        } else {
            notify.failure(formState.message);
        }
    };

    // variant 선택 처리
    const handleVariantSelect = (variant: any) => {
        setSelectedVariant(variant);
        // 🎯 선택한 variant의 재고보다 현재 수량이 많으면 수량을 재고 수만큼 조정
        const variantInventory = variant.inventory || 0;
        if (quantity > variantInventory) {
            setQuantity(Math.max(1, Math.min(quantity, variantInventory)));
        }
    };

    // 🎯 선택된 variant의 재고 상태
    const isSelectedVariantOutOfStock = selectedVariant
        ? ((selectedVariant.inventory || 0) <= 0 || selectedVariant.is_active !== true)
        : false;

    // 🎯 variant 선택 필요 여부
    const isVariantSelected = !hasVariants || selectedVariant !== null;

    // 🎯 최종 주문 가능 여부 판단
    const canOrder = !isProductOutOfStock && // 전체 상품이 품절이 아니고
        isVariantSelected && // variant가 선택되었고 (필요한 경우)
        !isSelectedVariantOutOfStock && // 선택된 variant가 품절이 아니고
        quantity > 0 && // 수량이 1개 이상이고
        quantity <= (hasVariants && selectedVariant ? (selectedVariant.inventory || 0) : (product.inventory || 0)); // 재고 범위 내

    // 🎯 현재 사용 가능한 최대 재고
    const getCurrentMaxInventory = () => {
        if (hasVariants && selectedVariant) {
            return selectedVariant.inventory || 0;
        }
        return product.inventory || 0;
    };

    // 🎯 버튼 텍스트 결정
    const getButtonText = () => {
        if (isProductOutOfStock) return '품절';
        if (hasVariants && !selectedVariant) return '색상을 선택해주세요';
        if (isSelectedVariantOutOfStock) return '선택한 색상 품절';
        if (quantity > getCurrentMaxInventory()) return '재고 부족';
        return '바로 구매하기';
    };

    const handleAddToCart = async () => {
        if (!user) return router.push('/login');

        showLoading();
        try {
            const formState = await addToCart({
                productId: product.id,
                quantity: quantity,
                variantId: selectedVariant?.id,
                colorName: selectedVariant?.color,
                colorCode: selectedVariant?.color_code,
                userId: user.id
            });

            if (formState.code === ERROR_CODES.SUCCESS) {
                notify.success(formState.message);
            } else {
                notify.failure(formState.message);
            }
        } catch (error) {
            notify.failure('장바구니 추가 중 오류가 발생했습니다.');
        } finally {
            hideLoading();
        }
    };

    return (
        <div className={`bg-white text-black rounded-lg shadow-md p-4 lg:p-6 w-full ${className}`}>
            {/* 🎯 모바일에서 더 컴팩트한 제목 */}
            <h3 className="text-base lg:text-lg font-bold border-b pb-2 lg:pb-3 mb-3 lg:mb-4">주문 정보</h3>

            {/* 🎯 전체 상품 품절 경고 */}
            {isProductOutOfStock && (
                <div className="mb-3 lg:mb-4 p-2 lg:p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-red-700 text-xs lg:text-sm font-medium">
                        ⚠️ {hasVariants ? '모든 색상이 품절되었습니다.' : '상품이 품절되었습니다.'}
                    </p>
                </div>
            )}

            {/* 색상(variant) 선택 옵션 - 모바일 최적화 */}
            {hasVariants && (
                <div className="mb-3 lg:mb-4">
                    <label className="font-medium block mb-2 text-sm lg:text-base">
                        색상
                        <span className="text-xs lg:text-sm text-gray-500 ml-1">
                            ({productVariants.filter((v: any) => (v.is_active === true) && (v.inventory || 0) > 0).length}개 선택 가능)
                        </span>
                    </label>

                    {/* 🎯 모바일에서 더 작은 간격과 크기 */}
                    <div className="flex flex-wrap gap-2 lg:gap-3">
                        {productVariants.map((variant: any) => {
                            const isVariantOutOfStock = (variant.is_active !== true) || (variant.inventory || 0) <= 0;
                            const isSelected = selectedVariant?.id === variant.id;

                            return (
                                <div key={variant.id} className="flex flex-col items-center">
                                    <button
                                        onClick={() => handleVariantSelect(variant)}
                                        disabled={isVariantOutOfStock}
                                        className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 relative transition-all ${
                                            isSelected
                                                ? 'border-black border-2 lg:border-4 shadow-lg'
                                                : 'border-gray-200 hover:border-gray-400'
                                        } ${isVariantOutOfStock ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                                        style={{backgroundColor: variant.color_code || '#ccc'}}
                                        title={`${variant.color || '색상'} (재고: ${variant.inventory || 0}개)${isVariantOutOfStock ? ' - 품절' : ''}`}
                                    >
                                        {/* 🎯 품절 표시 */}
                                        {isVariantOutOfStock && (
                                            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50">
                                                <span className="text-white text-xs font-bold">✕</span>
                                            </div>
                                        )}
                                        {/* 🎯 선택됨 표시 */}
                                        {isSelected && !isVariantOutOfStock && (
                                            <div className="absolute inset-0 flex items-center justify-center rounded-full">
                                                <span className="text-white text-xs">✓</span>
                                            </div>
                                        )}
                                    </button>
                                    <span className={`font-Nanum text-xs mt-1 text-center ${
                                        isVariantOutOfStock ? 'text-gray-400 line-through' : ''
                                    } ${isSelected ? 'font-bold' : ''}`}>
                                        {variant.color || '색상'}
                                    </span>
                                    <span className={`text-xs ${
                                        isVariantOutOfStock ? 'text-red-500' : 'text-gray-500'
                                    }`}>
                                        {isVariantOutOfStock ? '품절' : `${variant.inventory || 0}개`}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* 🎯 선택 상태 메시지 */}
                    {hasVariants && !selectedVariant && (
                        <p className="text-red-500 text-xs lg:text-sm mt-2">색상을 선택해 주세요</p>
                    )}
                    {selectedVariant && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs lg:text-sm">
                            <p className="text-blue-800">
                                ✅ 선택: <strong>{selectedVariant.color || '색상'}</strong>
                                <span className="ml-2">재고: {selectedVariant.inventory || 0}개</span>
                                {isSelectedVariantOutOfStock && (
                                    <span className="text-red-500 ml-2 font-bold">품절</span>
                                )}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* 수량 선택 - 모바일 최적화 */}
            <div className="mb-3 lg:mb-4">
                <label className="font-medium block mb-2 text-sm lg:text-base">
                    수량
                    <span className="text-xs lg:text-sm text-gray-500 ml-1">
                        (최대 {getCurrentMaxInventory()}개)
                    </span>
                </label>
                <div className="flex items-center">
                    <button
                        onClick={decreaseQuantity}
                        disabled={quantity <= 1 || !canOrder}
                        className="px-2 lg:px-3 py-1 lg:py-2 border rounded-l-md bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base"
                    >
                        -
                    </button>
                    <input
                        type="number"
                        min="1"
                        max={getCurrentMaxInventory()}
                        value={quantity}
                        onChange={(e) => {
                            const value = parseInt(e.target.value);
                            const maxInventory = getCurrentMaxInventory();

                            if (!isNaN(value) && value >= 1 && value <= maxInventory) {
                                setQuantity(value);
                            }
                        }}
                        className="w-12 lg:w-16 text-center border-t border-b py-1 lg:py-2 text-sm lg:text-base"
                        disabled={!canOrder}
                    />
                    <button
                        onClick={increaseQuantity}
                        disabled={quantity >= getCurrentMaxInventory() || !canOrder}
                        className="px-2 lg:px-3 py-1 lg:py-2 border rounded-r-md bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base"
                    >
                        +
                    </button>
                </div>

                {quantity > getCurrentMaxInventory() && (
                    <p className="text-red-500 text-xs mt-1">
                        재고가 부족합니다. 최대 {getCurrentMaxInventory()}개까지 주문 가능합니다.
                    </p>
                )}
            </div>

            {/* 가격 요약 - 모바일 최적화 */}
            <div className="mb-4 lg:mb-6 space-y-1 lg:space-y-2">
                <div className="flex justify-between text-sm lg:text-base">
                    <span className="text-gray-600">상품 가격</span>
                    <span>
                        {product.sale_price ? (
                            <span>
                                <span className="text-red-500 font-medium">{formatPrice(product.sale_price)}</span>
                                <span className="text-gray-400 text-xs lg:text-sm line-through ml-1">{formatPrice(product.price)}</span>
                            </span>
                        ) : (
                            formatPrice(product.price)
                        )}
                    </span>
                </div>
                <div className="flex justify-between text-sm lg:text-base">
                    <span className="text-gray-600">수량</span>
                    <span>{quantity}개</span>
                </div>
                {hasVariants && selectedVariant && (
                    <div className="flex justify-between text-sm lg:text-base">
                        <span className="text-gray-600">선택한 색상</span>
                        <span>{selectedVariant.color || '색상'}</span>
                    </div>
                )}
                <div className="pt-2 border-t flex justify-between font-bold text-sm lg:text-base">
                    <span>총 가격</span>
                    <span className="text-base lg:text-lg">{formatPrice(getTotalPrice())}</span>
                </div>
            </div>

            {/* 버튼 - 모바일 최적화 */}
            <div className="space-y-2">
                <button
                    className={`w-full py-2 lg:py-3 rounded-md font-medium transition-colors text-sm lg:text-base ${
                        canOrder
                            ? 'bg-black text-white hover:bg-gray-800'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!canOrder}
                    onClick={handleOrder}
                >
                    {getButtonText()}
                </button>
                <button
                    onClick={handleAddToCart}
                    className={`w-full py-2 lg:py-3 border rounded-md font-medium transition-colors text-sm lg:text-base ${
                        canOrder && !isLoading
                            ? 'border-black hover:bg-gray-50'
                            : 'border-gray-300 text-gray-300 cursor-not-allowed'
                    }`}
                    disabled={!canOrder || isLoading}
                >
                    {isLoading ? '처리 중...' : '장바구니에 추가'}
                </button>
            </div>

            {/* 🎯 상태별 안내 메시지 */}
            {hasVariants && selectedVariant && isSelectedVariantOutOfStock && (
                <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs lg:text-sm text-orange-700">
                    ⚠️ 선택한 색상이 품절되었습니다. 다른 색상을 선택해주세요.
                </div>
            )}

            {/* 🎯 모바일용 추가 안내 */}
            {hasVariants && !isProductOutOfStock && (
                <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700 lg:hidden">
                    💡 색상별 재고가 다르니 원하는 색상을 선택해주세요.
                </div>
            )}
        </div>
    );
}