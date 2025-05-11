import React from 'react';
import { createClient } from "@/utils/server";
import { redirect } from "next/navigation";
import { getOrdersProduct } from "@/app/(main)/order/payment/[id]/actions";
import Image from "next/image";

// 가격 포맷팅 함수
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
};

// 주문 상태 표시 컴포넌트
const OrderStatus = ({ status }: { status: string }) => {
    const getStatusColor = () => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'paid': return 'bg-green-100 text-green-800';
            case 'shipping': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-purple-100 text-purple-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'pending': return '결제 대기';
            case 'paid': return '결제 완료';
            case 'shipping': return '배송 중';
            case 'completed': return '배송 완료';
            case 'cancelled': return '주문 취소';
            default: return status;
        }
    };

    return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
      {getStatusText()}
    </span>
    );
};

// 주문 정보 컴포넌트
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
                    <OrderStatus status={order.order_status} />
                </div>

                <div>
                    <p className="text-gray-600">결제 상태</p>
                    <OrderStatus status={order.payment_status} />
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

// 배송지 정보 컴포넌트
const ShippingInfo = ({ address }: { address: any }) => {
    if (!address) return <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">배송지 정보</h2>
        <p className="text-gray-500">배송지 정보를 불러올 수 없습니다.</p>
    </div>;

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">배송지 정보</h2>

            <div className="space-y-3">
                <div>
                    <p className="text-gray-600">받는 사람</p>
                    <p className="font-medium">{address.recipient_name}</p>
                </div>

                <div>
                    <p className="text-gray-600">연락처</p>
                    <p className="font-medium">{address.phone_number}</p>
                </div>

                <div>
                    <p className="text-gray-600">주소</p>
                    <p className="font-medium">{address.address_line1} {address.address_line2}</p>
                </div>
            </div>
        </div>
    );
};

// 주문 상품 컴포넌트
const OrderProducts = ({ products }: { products: any[] }) => {
    if (!products || products.length === 0) return <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">주문 상품</h2>
        <p className="text-gray-500">주문 상품 정보를 불러올 수 없습니다.</p>
    </div>;

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">주문 상품 ({products.length}개)</h2>

            <div className="space-y-4">
                {products.map((item, index) => (
                    <div key={index} className="flex items-center border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded mr-4 overflow-hidden">
                            {item.product_image ? (
                                <Image
                                    src={item.product_image}
                                    alt={item.product_name}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    이미지 없음
                                </div>
                            )}
                        </div>

                        <div className="flex-grow">
                            <h3 className="font-medium">{item.product_name}</h3>
                            {item.color && (
                                <p className="text-sm text-gray-600">
                                    {item.color} {item.color_code &&
                                    <span className="inline-block w-3 h-3 rounded-full ml-1"
                                          style={{ backgroundColor: item.color_code }} />
                                }
                                </p>
                            )}
                            <p className="text-sm text-gray-600">수량: {item.quantity}개</p>
                        </div>

                        <div className="text-right">
                            <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                            {item.original_price > item.price && (
                                <p className="text-sm text-gray-500 line-through">
                                    {formatPrice(item.original_price * item.quantity)}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between items-center">
                    <span className="font-medium">총 상품 금액</span>
                    <span className="font-bold text-lg">
            {formatPrice(products.reduce((total, item) => total + (item.price * item.quantity), 0))}
          </span>
                </div>
            </div>
        </div>
    );
};

// 결제 버튼 컴포넌트
const PaymentButton = ({ order }: { order: any }) => {
    if (order.payment_status !== 'pending') return null;

    return (
        <div className="mt-6">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded">
                결제 진행하기
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
                결제하기 버튼을 클릭하면 구매조건에 동의하는 것으로 간주합니다.
            </p>
        </div>
    );
};

