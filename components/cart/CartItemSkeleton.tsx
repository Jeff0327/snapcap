import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface CartItemSkeletonProps {
    count?: number;
}

export function CartItemSkeleton({ count = 3 }: CartItemSkeletonProps) {
    return (
        <Card className="bg-white rounded-lg shadow-md p-12 w-full container my-12 mx-auto">
            <div className="flex justify-between items-center mb-6 border-b pb-2">
                <Skeleton className="h-8 w-32" />
            </div>

            <div className="space-y-6">
                {Array(count).fill(0).map((_, index) => (
                    <div key={index} className="flex items-center pb-4 border-b last:border-b-0">
                        {/* 상품 이미지 스켈레톤 */}
                        <Skeleton className="w-20 h-20 rounded flex-shrink-0" />

                        {/* 상품 정보 스켈레톤 */}
                        <div className="ml-4 flex-grow">
                            <div className="flex justify-between">
                                <Skeleton className="h-5 w-40 mb-2" />
                                <Skeleton className="h-5 w-5" />
                            </div>

                            <Skeleton className="h-4 w-24 mb-2" />

                            <div className="flex justify-between items-center mt-4">
                                <Skeleton className="h-8 w-24" />
                                <Skeleton className="h-5 w-20" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 주문 요약 스켈레톤 */}
            <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-8 w-32" />
                </div>

                <Skeleton className="h-12 w-full rounded-md" />
            </div>
        </Card>
    );
}