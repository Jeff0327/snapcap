import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDate, formatPrice, getStatusLabel, getOrderStatusColor, getPaymentStatusColor } from '@/utils/utils';
import { Orders } from "@/types";

export default function OrderList({ orders }: { orders: Orders[] | [] }) {
    // 주문 상태에 따른 링크 생성 함수
    const getOrderLink = (order: Orders) => {
        // payment_status가 pending이면 결제 페이지로, 그렇지 않으면 주문 상세 페이지로
        if (order.payment_status === 'pending') {
            return `/order/payment/${order.id}`; // 결제 페이지
        } else {
            return `/order/complete/${order.id}`; // 주문 완료/상세 페이지
        }
    };

    return (
        <div className="space-y-4 my-12">
            {orders.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">주문 내역이 없습니다.</p>
                </div>
            ) : (
                orders.map((order) => (
                    <Link key={order.id} href={getOrderLink(order)}>
                        <div className="border dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 mb-1 bg-white dark:bg-gray-800">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-gray-700 dark:text-gray-300">
                                    {formatDate(order.created_at)}
                                </span>
                                <div className="flex space-x-2">
                                    {/* 결제 상태 표시 */}
                                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                                        {getStatusLabel(order.payment_status, 'payment')}
                                    </span>

                                    {/* 주문 상태 표시 */}
                                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${getOrderStatusColor(order.order_status)}`}>
                                        {getStatusLabel(order.order_status, 'order')}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                {order.primary_product_image ? (
                                    <Image
                                        src={order.primary_product_image}
                                        alt={order.primary_product_name || ''}
                                        width={60}
                                        height={60}
                                        className="rounded-md object-cover"
                                    />
                                ) : (
                                    <div className="w-[60px] h-[60px] bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center">
                                        <span className="text-gray-400 dark:text-gray-300 text-xs">이미지 없음</span>
                                    </div>
                                )}

                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900 dark:text-white">
                                        {order.primary_product_name}
                                        {order.items_count > 1 ? ` 외 ${order.items_count - 1}개` : ''}
                                    </h3>
                                    <p className="text-lg font-bold mt-1 text-gray-900 dark:text-gray-100">
                                        {formatPrice(order.total_amount)}
                                    </p>
                                </div>

                                <div className="flex items-center text-black dark:text-white">
                                    <span className="font-jalnan">
                                        {order.payment_status === 'pending' ? '결제하기' : '상세보기'}
                                    </span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20"
                                         fill="currentColor">
                                        <path fillRule="evenodd"
                                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                              clipRule="evenodd"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))
            )}
        </div>
    );
}