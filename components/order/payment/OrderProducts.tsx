// OrderProducts 컴포넌트 수정 예시
'use client';

import React from 'react';
import Image from 'next/image';
import { formatPrice } from '@/utils/utils';

interface OrderProductsProps {
    products: any[];
    inventoryCheck?: {
        success: boolean;
        has_out_of_stock: boolean;
        checks: Array<{
            product_id: string;
            product_name: string;
            order_quantity: number;
            current_inventory: number;
            is_in_stock: boolean;
            shortage: number;
        }>;
        can_proceed: boolean;
    } | null;
}

export default function OrderProducts({ products, inventoryCheck }: OrderProductsProps) {
    // 재고 확인 정보를 product_id로 매핑
    const inventoryMap = new Map();
    if (inventoryCheck?.checks) {
        inventoryCheck.checks.forEach(check => {
            inventoryMap.set(check.product_id, check);
        });
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 text-black">
            <h2 className="text-lg font-bold mb-4">주문 상품</h2>

            <div className="space-y-4">
                {products.map((orderProduct, index) => {
                    const product = orderProduct.product;
                    const inventoryInfo = inventoryMap.get(orderProduct.product_id);
                    const isOutOfStock = inventoryInfo && !inventoryInfo.is_in_stock;

                    return (
                        <div
                            key={orderProduct.id || index}
                            className={`flex space-x-4 p-4 border rounded-lg ${
                                isOutOfStock ? 'border-red-200 bg-red-50' : 'border-gray-200'
                            }`}
                        >
                            {/* 상품 이미지 */}
                            <div className="w-20 h-20 flex-shrink-0">
                                {product?.images?.[0] && (
                                    <Image
                                        src={product.images[0]}
                                        alt={product.name || '상품 이미지'}
                                        width={80}
                                        height={80}
                                        className="w-full h-full object-cover rounded"
                                    />
                                )}
                            </div>

                            {/* 상품 정보 */}
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className={`font-medium ${isOutOfStock ? 'text-red-800' : ''}`}>
                                            {orderProduct.product_name || product?.name}
                                        </h3>

                                        {orderProduct.color && (
                                            <p className="text-sm text-gray-600">
                                                색상: {orderProduct.color}
                                            </p>
                                        )}

                                        <p className="text-sm text-gray-600">
                                            수량: {orderProduct.quantity}개
                                        </p>

                                        {/* 🎯 재고 상태 표시 */}
                                        {inventoryInfo && (
                                            <div className="mt-2">
                                                {inventoryInfo.is_in_stock ? (
                                                    <div className="flex items-center text-sm text-green-600">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        재고 충분 (현재 {inventoryInfo.current_inventory}개)
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center text-sm text-red-600">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                        </svg>
                                                        품절 - {inventoryInfo.shortage}개 부족
                                                        (현재 재고: {inventoryInfo.current_inventory}개)
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* 가격 정보 */}
                                    <div className="text-right">
                                        <div className={`font-medium ${isOutOfStock ? 'text-red-600' : ''}`}>
                                            {formatPrice(orderProduct.price * orderProduct.quantity)}
                                        </div>

                                        {orderProduct.original_price && orderProduct.original_price !== orderProduct.price && (
                                            <div className="text-sm text-gray-500 line-through">
                                                {formatPrice(orderProduct.original_price * orderProduct.quantity)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 🎯 재고 요약 정보 */}
            {inventoryCheck && (
                <div className="mt-4 pt-4 border-t">
                    {inventoryCheck.has_out_of_stock ? (
                        <div className="bg-red-50 border border-red-200 rounded p-3">
                            <p className="text-sm font-medium text-red-800">
                                ⚠️ {inventoryCheck.checks.filter(c => !c.is_in_stock).length}개 상품이 품절되었습니다
                            </p>
                        </div>
                    ) : (
                        <div className="bg-green-50 border border-green-200 rounded p-3">
                            <p className="text-sm font-medium text-green-800">
                                ✅ 모든 상품의 재고가 충분합니다
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}