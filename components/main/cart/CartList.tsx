'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import useAlert from "@/lib/notiflix/useAlert";
import { formatPrice } from "@/utils/utils";
import { CartItem } from "@/types";
import { useLoading } from "@/components/layout/LoadingProvider";
import { removeCartItem, updateCartItemQuantity } from '@/app/(main)/cart/actions';
import {Card} from "@/components/ui/card";

interface CartListProps {
    initialCartItems: CartItem[];
}

export function CartList({ initialCartItems }: CartListProps) {
    const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
    const { showLoading, hideLoading } = useLoading();
    const router = useRouter();
    const { notify } = useAlert();

    const handleRemoveItem = async (itemId: string) => {
        showLoading();
        try {
            const result = await removeCartItem(itemId);

            if (result.success) {
                setCartItems(cartItems.filter(item => item.id !== itemId));
                notify.success(result.message);
            } else {
                notify.failure(result.message);
            }
        } catch (error) {
            console.error('장바구니 삭제 중 오류 발생:', error);
            notify.failure('상품 삭제 중 오류가 발생했습니다.');
        } finally {
            hideLoading();
        }
    };

    const handleQuantityChange = async (itemId: string, newQuantity: number) => {
        if (newQuantity < 1) return;

        const item = cartItems.find(item => item.id === itemId);
        if (!item || !item.product) return;

        // 재고 확인
        if (newQuantity > item.product.inventory) {
            notify.failure('요청하신 수량이 재고보다 많습니다.');
            return;
        }

        showLoading();
        try {
            const result = await updateCartItemQuantity(itemId, newQuantity);

            if (result.success) {
                setCartItems(cartItems.map(item =>
                    item.id === itemId ? { ...item, quantity: newQuantity } : item
                ));
                // 성공 메시지는 노출하지 않음 (UI가 이미 변경됨)
            } else {
                notify.failure(result.message);
            }
        } catch (error) {
            console.error('수량 변경 중 오류 발생:', error);
            notify.failure('수량 변경 중 오류가 발생했습니다.');
        } finally {
            hideLoading();
        }
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            notify.failure('장바구니에 상품이 없습니다.');
            return;
        }
        router.push('/checkout');
    };

    const getTotalPrice = () => {
        return cartItems.reduce((total, item) => {
            if (!item.product) return total;
            const price = item.product.sale_price || item.product.price;
            return total + (price * item.quantity);
        }, 0);
    };

    // 장바구니가 비어있을 때 UI
    if (cartItems.length === 0) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold mb-4">장바구니가 비어있습니다</h2>
                <p className="text-gray-600 mb-6">쇼핑을 계속하고 마음에 드는 상품을 장바구니에 추가해보세요.</p>
                <button
                    onClick={() => router.push('/main')}
                    className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                >
                    쇼핑 계속하기
                </button>
            </div>
        );
    }

    // 장바구니 목록 UI
    return (
        <Card className="bg-white rounded-lg shadow-md p-12 w-full my-12">
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">장바구니</h2>

            <div className="space-y-4">
                {cartItems.map(item => (
                    <div key={item.id} className="flex items-center pb-4">
                        {/* 상품 이미지 */}
                        <div className="w-20 h-20 relative flex-shrink-0">
                            {item.product?.images && item.product.images.length > 0 ? (
                                <Image
                                    src={item.product.images[0]}
                                    alt={item.product?.name || '상품 이미지'}
                                    fill
                                    className="object-cover rounded"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                                    <span className="text-gray-400">이미지 없음</span>
                                </div>
                            )}
                        </div>

                        {/* 상품 정보 */}
                        <div className="ml-4 flex-grow">
                            <div className="flex justify-between">
                                <h3 className="font-medium">{item.product?.name}</h3>
                                <button
                                    onClick={() => handleRemoveItem(item.id)}
                                    className="text-gray-400 hover:text-red-500"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="text-sm text-gray-500 mt-2">
                                색상: <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ backgroundColor: item.color_code }}></span>
                                {item.color}
                            </div>

                            <div className="flex justify-between items-center mt-2">
                                <div className="flex items-center">
                                    <button
                                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                        className="px-2 py-1 border rounded-l-md bg-gray-50"
                                    >
                                        -
                                    </button>
                                    <span className="w-8 text-center border-t border-b py-1">{item.quantity}</span>
                                    <button
                                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                        className="px-2 py-1 border rounded-r-md bg-gray-50"
                                        disabled={item.product && item.quantity >= item.product.inventory}
                                    >
                                        +
                                    </button>
                                </div>

                                <div className="text-right">
                                    {item.product?.sale_price ? (
                                        <div>
                                            <span className="text-red-500 font-medium">{formatPrice(item.product.sale_price * item.quantity)}</span>
                                            <span className="text-gray-400 text-sm line-through ml-1">{formatPrice(item.product.price * item.quantity)}</span>
                                        </div>
                                    ) : (
                                        <div>{formatPrice((item.product?.price || 0) * item.quantity)}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 주문 요약 */}
            <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                    <span className="font-bold">총 합계</span>
                    <span className="font-bold text-xl">{formatPrice(getTotalPrice())}</span>
                </div>

                <button
                    onClick={handleCheckout}
                    className="w-full py-3 bg-black text-white rounded-md hover:bg-gray-800"
                >
                    주문하기
                </button>
            </div>
        </Card>
    );
}