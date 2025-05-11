import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/utils/utils';
import {Orders} from "@/types";

export default function OrderList({ orders }: { orders: Orders[] }) {
    return (
        <div className="space-y-4">
            {orders.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">주문 내역이 없습니다.</p>
                </div>
            ) : (
                orders.map((order) => (
                    <Link key={order.id} href={`/orders/${order.id}`}>
                        <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">
                  {/*{formatDate(order.created_at)}*/}
                </span>
                                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                                    order.order_status === 'completed' ? 'bg-green-100 text-green-800' :
                                        order.order_status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                            'bg-blue-100 text-blue-800'
                                }`}>
                  {order.order_status === 'pending' ? '결제 대기' :
                      order.order_status === 'processing' ? '처리 중' :
                          order.order_status === 'shipping' ? '배송 중' :
                              order.order_status === 'completed' ? '배송 완료' :
                                  order.order_status === 'cancelled' ? '주문 취소' :
                                      order.order_status}
                </span>
                            </div>

                            <div className="flex items-center space-x-4">
                                {order.primary_product_image ? (
                                    <Image
                                        src={order.primary_product_image}
                                        alt={order.primary_product_name||''}
                                        width={60}
                                        height={60}
                                        className="rounded-md object-cover"
                                    />
                                ) : (
                                    <div className="w-[60px] h-[60px] bg-gray-200 rounded-md flex items-center justify-center">
                                        <span className="text-gray-400 text-xs">이미지 없음</span>
                                    </div>
                                )}

                                <div className="flex-1">
                                    <h3 className="font-medium">
                                        {order.primary_product_name}
                                        {order.items_count > 1 ? ` 외 ${order.items_count - 1}개` : ''}
                                    </h3>
                                    <p className="text-lg font-bold mt-1">{formatPrice(order.total_amount)}</p>
                                </div>

                                <div className="flex items-center text-blue-600">
                                    <span>상세보기</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
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