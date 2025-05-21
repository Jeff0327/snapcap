'use client';
import React, { useState } from 'react';
import { ProductsJson } from '@/types';
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { ERROR_CODES } from "@/utils/ErrorMessage";
import useAlert from "@/lib/notiflix/useAlert";
import {addToCart} from "@/app/(main)/products/[id]/actions";
import {useLoading} from "@/components/layout/LoadingProvider";

interface CheckoutPanelProps {
    product: ProductsJson;
    user: User | null
}

export function CheckoutPanel({ product, user }: CheckoutPanelProps) {
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
    const router = useRouter();
    const { notify } = useAlert();
    const {showLoading, hideLoading,isLoading} = useLoading();

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

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const increaseQuantity = () => {
        // 선택된 variant가 있으면 해당 variant의 재고를 확인, 없으면 상품의 전체 재고 확인
        const maxInventory = selectedVariant
            ? selectedVariant.inventory
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
    };

    // 재고 확인 및 주문 가능 상태 계산
    const hasVariants = product.variants !== undefined &&
        Array.isArray(product.variants) &&
        product.variants.length > 0;
    const isOutOfStock = product.variants && Array.isArray(product.variants) && product.variants.length > 0
        ? !product.variants.some(v => v.inventory > 0 && v.is_active)
        : product.inventory <= 0;
    const isVariantSelected = !hasVariants || selectedVariant !== null;
    const canOrder = !isOutOfStock && isVariantSelected;

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
        <div className="bg-white rounded-lg shadow-md p-6 w-full">
            <h3 className="text-lg font-bold border-b pb-3 mb-4">주문 정보</h3>

            {/* 색상(variant) 선택 옵션 */}
            {hasVariants && (
                <div className="mb-4">
                    <label className="font-medium block mb-2">색상</label>
                    <div className="flex flex-wrap gap-2">
                        {product.variants && product.variants.map((variant) => (
                            <div key={variant.id} className={'flex flex-col items-center'}>
                                <button
                                    onClick={() => handleVariantSelect(variant)}
                                    disabled={!variant.is_active || variant.inventory <= 0}
                                    className={`w-8 h-8 rounded-full border-2 ${
                                        selectedVariant?.id === variant.id
                                            ? 'border-black'
                                            : 'border-gray-200'
                                    } ${(!variant.is_active || variant.inventory <= 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    style={{backgroundColor: variant.color_code}}
                                    title={`${variant.color}${!variant.is_active || variant.inventory <= 0 ? ' (품절)' : ''}`}
                                >

                                </button>
                                <span className={'font-Nanum text-sm'}>{variant.color}</span>
                            </div>
                        ))}
                    </div>
                    {hasVariants && !selectedVariant && (
                        <p className="text-red-500 text-sm mt-1">색상을 선택해 주세요</p>
                    )}
                </div>
            )}

            {/* 수량 선택 */}
            <div className="mb-4">
                <label className="font-medium block mb-2">수량</label>
                <div className="flex items-center">
                    <button
                        onClick={decreaseQuantity}
                        disabled={quantity <= 1 || isOutOfStock}
                        className="px-3 py-1 border rounded-l-md bg-gray-50 disabled:opacity-50"
                    >
                        -
                    </button>
                    <input
                        type="number"
                        min="1"
                        max={selectedVariant ? selectedVariant.inventory : (product.inventory || 1)}
                        value={quantity}
                        onChange={(e) => {
                            const value = parseInt(e.target.value);
                            const maxInventory = selectedVariant
                                ? selectedVariant.inventory
                                : (product.inventory || 1);

                            if (!isNaN(value) && value >= 1 && value <= maxInventory) {
                                setQuantity(value);
                            }
                        }}
                        className="w-12 text-center border-t border-b py-1"
                        disabled={isOutOfStock}
                    />
                    <button
                        onClick={increaseQuantity}
                        disabled={
                            quantity >= (selectedVariant ? selectedVariant.inventory : (product.inventory || 0)) ||
                            isOutOfStock
                        }
                        className="px-3 py-1 border rounded-r-md bg-gray-50 disabled:opacity-50"
                    >
                        +
                    </button>
                </div>
            </div>

            {/* 가격 요약 */}
            <div className="mb-6 space-y-2">
                <div className="flex justify-between">
                    <span className="text-gray-600">상품 가격</span>
                    <span>
                        {product.sale_price ? (
                            <span>
                                <span className="text-red-500 font-medium">{formatPrice(product.sale_price)}</span>
                                <span className="text-gray-400 text-sm line-through ml-1">{formatPrice(product.price)}</span>
                            </span>
                        ) : (
                            formatPrice(product.price)
                        )}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">수량</span>
                    <span>{quantity}개</span>
                </div>
                <div className="pt-2 border-t flex justify-between font-bold">
                    <span>총 가격</span>
                    <span>{formatPrice(getTotalPrice())}</span>
                </div>
            </div>

            {/* 버튼 */}
            <div className="space-y-2">
                <button
                    className="w-full py-3 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    disabled={!canOrder}
                    onClick={handleOrder}
                >
                    {isOutOfStock ? '품절' : '바로 구매하기'}
                </button>
                <button
                    onClick={handleAddToCart}
                    className="w-full py-3 border border-black rounded-md hover:bg-gray-50 disabled:border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed"
                    disabled={!canOrder || isLoading}
                >
                    {isLoading ? '처리 중...' : '장바구니에 추가'}
                </button>
            </div>
        </div>
    );
}