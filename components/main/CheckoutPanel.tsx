'use client';
import React, { useState } from 'react';
import { Products } from '@/types';
import { useRouter } from "next/navigation";

interface CheckoutPanelProps {
    product: Products;
}

export function CheckoutPanel({ product }: CheckoutPanelProps) {
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const router = useRouter();

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
        if (quantity < (product.inventory || 0)) {
            setQuantity(quantity + 1);
        }
    };

    const handleOrder = () => {
        // URL에 제품 ID, 수량, 색상 정보를 포함하여 주문 페이지로 이동
        const queryParams = new URLSearchParams();
        queryParams.append('quantity', quantity.toString());

        if (selectedColor) {
            queryParams.append('color', selectedColor);
        }

        if (selectedSize) {
            queryParams.append('size', selectedSize);
        }

        router.push(`/order/checkout/${product.id}?${queryParams.toString()}`);
    };

    // 색상 선택 처리
    const handleColorSelect = (color: string) => {
        setSelectedColor(color);
    };

    // 사이즈 선택 처리
    const handleSizeSelect = (size: string) => {
        setSelectedSize(size);
    };

    const isOutOfStock = product.inventory <= 0;
    const isOptionSelected = !product.colors || selectedColor !== null;
    const canOrder = !isOutOfStock && isOptionSelected;

    return (
        <div className="bg-white rounded-lg shadow-md p-6 w-full">
            <h3 className="text-lg font-bold border-b pb-3 mb-4">주문 정보</h3>

            {/* 색상 선택 옵션 */}
            {product.colors && (
                <div className="mb-4">
                    <label className="font-medium block mb-2">색상</label>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(product.colors).map(([color, colorCode]) => (
                            <button
                                key={color}
                                onClick={() => handleColorSelect(color)}
                                className={`w-8 h-8 rounded-full border-2 ${
                                    selectedColor === color
                                        ? 'border-black'
                                        : 'border-gray-200'
                                }`}
                                style={{ backgroundColor: colorCode as string }}
                                title={color}
                            />
                        ))}
                    </div>
                    {product.colors && !selectedColor && (
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
                        max={product.inventory || 1}
                        value={quantity}
                        onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value) && value >= 1 && value <= (product.inventory || 1)) {
                                setQuantity(value);
                            }
                        }}
                        className="w-12 text-center border-t border-b py-1"
                        disabled={isOutOfStock}
                    />
                    <button
                        onClick={increaseQuantity}
                        disabled={quantity >= (product.inventory || 0) || isOutOfStock}
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
                    // onClick={onAddToCart}
                    className="w-full py-3 border border-black rounded-md hover:bg-gray-50 disabled:border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed"
                    disabled={!canOrder}
                >
                    장바구니에 추가
                </button>
            </div>
        </div>
    );
}