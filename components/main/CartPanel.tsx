'use client';
import React from 'react';
import { Products } from '@/types';
import { ShoppingBag, Heart, Share2 } from 'lucide-react';

interface CartPanelProps {
    product: Products;
}

export function CartPanel({ product }: CartPanelProps) {
    // 상품 공유 기능
    const shareProduct = () => {
        if (navigator.share) {
            navigator.share({
                title: product.name,
                text: `${product.name} - 지금 확인해보세요!`,
                url: window.location.href,
            })
                .catch(err => console.error('공유하기 실패:', err));
        } else {
            // 공유 API를 지원하지 않는 경우 URL 복사
            navigator.clipboard.writeText(window.location.href)
                .then(() => alert('URL이 복사되었습니다!'))
                .catch(err => console.error('URL 복사 실패:', err));
        }
    };

    // 위시리스트에 추가
    const addToWishlist = () => {
        // 위시리스트 추가 로직 구현
        alert('위시리스트에 추가되었습니다!');
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 w-full">
            <h3 className="text-lg font-bold border-b pb-3 mb-4">쇼핑 도구</h3>

            {/* 장바구니 관련 기능 */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                    <ShoppingBag className="h-5 w-5" />
                    <div>
                        <h4 className="font-medium">장바구니</h4>
                        <p className="text-sm text-gray-500">나중에 구매하기 위해 저장</p>
                    </div>
                </div>

                <div onClick={addToWishlist} className="flex items-center gap-3 p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                    <Heart className="h-5 w-5" />
                    <div>
                        <h4 className="font-medium">위시리스트</h4>
                        <p className="text-sm text-gray-500">좋아하는 상품 저장</p>
                    </div>
                </div>

                <div onClick={shareProduct} className="flex items-center gap-3 p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                    <Share2 className="h-5 w-5" />
                    <div>
                        <h4 className="font-medium">공유하기</h4>
                        <p className="text-sm text-gray-500">친구들에게 이 상품 공유</p>
                    </div>
                </div>
            </div>

            {/* 추가 정보 */}
            <div className="mt-6 border-t pt-4">
                <h4 className="font-medium mb-2">안내사항</h4>
                <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                    <li>30일 내 무료 반품</li>
                    <li>회원 구매 시 적립금 적용</li>
                    <li>대량 구매 시 할인 가능</li>
                </ul>
            </div>
        </div>
    );
}