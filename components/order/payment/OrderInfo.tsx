import React from 'react';
import OrderStatus from "@/components/order/payment/OrderStatus";
import {formatPrice} from "@/utils/utils";

const OrderInfo = ({ order }: { order: any }) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">주문 정보</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p className="text-gray-600">주문 번호</p>
                    <p className="font-medium">{order.order_number || '처리 중'}</p>
                </div>

                <div>
                    <p className="text-gray-600">주문 일자</p>
                    <p className="font-medium">{new Date(order.created_at).toLocaleDateString('ko-KR')}</p>
                </div>

                <div>
                    <p className="text-gray-600">주문 상태</p>
                    <OrderStatus status={order.order_status} type="order" />
                </div>

                <div>
                    <p className="text-gray-600">결제 상태</p>
                    <OrderStatus status={order.payment_status} type="payment" />
                </div>

                <div>
                    <p className="text-gray-600">결제 수단</p>
                    <p className="font-medium">{order.payment_method === 'pending' ? '결제 대기' : order.payment_method}</p>
                </div>

                <div>
                    <p className="text-gray-600">총 결제 금액</p>
                    <p className="font-bold text-lg">{formatPrice(order.total_amount)}</p>
                </div>
            </div>

            {order.notes && (
                <div className="mt-4 pt-3 border-t">
                    <p className="text-gray-600">배송 메모</p>
                    <p>{order.notes}</p>
                </div>
            )}
        </div>
    );
};

export default OrderInfo;