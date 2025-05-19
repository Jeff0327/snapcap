'use client';

import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/utils";
import { OrderCompleteView } from "@/types";

// 확장된 주문 ID 상태 타입
interface ExpandedOrdersState {
    [key: string]: boolean;
}

// 상태 색상 맵 타입
interface StatusColorMap {
    [key: string]: string;
}

export default function OrderList({ orders }: { orders: OrderCompleteView[] }) {
    const [expandedOrders, setExpandedOrders] = useState<ExpandedOrdersState>({});

    const toggleOrderExpand = (orderId: string): void => {
        setExpandedOrders((prev) => ({
            ...prev,
            [orderId]: !prev[orderId],
        }));
    };

    const getOrderStatusColor = (status: string): string => {
        const statusColors: StatusColorMap = {
            pending: "bg-yellow-200 text-yellow-800",
            processing: "bg-blue-200 text-blue-800",
            shipped: "bg-purple-200 text-purple-800",
            delivered: "bg-green-200 text-green-800",
            cancelled: "bg-red-200 text-red-800",
            returned: "bg-gray-200 text-gray-800",
        };
        return statusColors[status.toLowerCase()] || "bg-gray-200 text-gray-800";
    };

    const getPaymentStatusColor = (status: string): string => {
        const statusColors: StatusColorMap = {
            pending: "bg-yellow-200 text-yellow-800",
            paid: "bg-green-200 text-green-800",
            failed: "bg-red-200 text-red-800",
            refunded: "bg-purple-200 text-purple-800",
        };
        return statusColors[status.toLowerCase()] || "bg-gray-200 text-gray-800";
    };

    // 사용자 정보 구성 - 뷰에 이미 정보가 있음
    const getUserInfo = (order: OrderCompleteView) => {
        return {
            name: order.customer_name || order.user_email?.split('@')[0] || '-',
            email: order.customer_email || order.user_email || '-',
            phone: order.customer_phone || '-'
        };
    };

    return (
        <div className="w-full">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>주문번호</TableHead>
                        <TableHead>주문일자</TableHead>
                        <TableHead>고객명</TableHead>
                        <TableHead>연락처</TableHead>
                        <TableHead>주문금액</TableHead>
                        <TableHead>상품수</TableHead>
                        <TableHead>결제상태</TableHead>
                        <TableHead>주문상태</TableHead>
                        <TableHead>상세보기</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => {
                        const userInfo = getUserInfo(order);
                        return (
                            <TableRow key={order.order_id}>
                                <TableCell className="font-medium">{order.order_number || order.order_id.slice(0,7)}</TableCell>
                                <TableCell>
                                    {formatDate(order.order_created_at)}
                                </TableCell>
                                <TableCell>{userInfo.name}</TableCell>
                                <TableCell>{userInfo.phone}</TableCell>
                                <TableCell>₩{order.total_amount?.toLocaleString()}</TableCell>
                                <TableCell>{order.items_count || order.order_products.length}</TableCell>
                                <TableCell>
                                    <Badge className={getPaymentStatusColor(order.payment_status)}>
                                        {order.payment_status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge className={getOrderStatusColor(order.order_status)}>
                                        {order.order_status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <button
                                        onClick={() => toggleOrderExpand(order.order_id)}
                                        className="text-blue-600 hover:text-blue-800 underline"
                                    >
                                        {expandedOrders[order.order_id] ? '닫기' : '상세보기'}
                                    </button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>

            {orders.map((order) => {
                const userInfo = getUserInfo(order);

                return expandedOrders[order.order_id] && (
                    <div key={`detail-${order.order_id}`} className="mt-2 mb-6 border rounded-md p-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <h3 className="text-lg font-bold mb-2">주문 정보</h3>
                                <p><span className="font-semibold">주문번호:</span> {order.order_number || order.order_id.slice(0,7)}</p>
                                <p><span className="font-semibold">결제방법:</span> {order.payment_method}</p>
                                <p><span className="font-semibold">결제상태:</span> {order.payment_status}</p>
                                <p><span className="font-semibold">주문상태:</span> {order.order_status}</p>
                                <p><span className="font-semibold">주문일자:</span> {formatDate(order.order_created_at)}</p>
                                {order.notes && <p><span className="font-semibold">메모:</span> {order.notes}</p>}
                            </div>

                            <div>
                                <h3 className="text-lg font-bold mb-2">고객 정보</h3>
                                <p><span className="font-semibold">이름:</span> {userInfo.name}</p>
                                <p><span className="font-semibold">이메일:</span> {userInfo.email}</p>
                                <p><span className="font-semibold">연락처:</span> {userInfo.phone}</p>

                                <h3 className="text-lg font-bold mt-4 mb-2">배송지 정보</h3>
                                {order.address_id ? (
                                    <>
                                        <p>{order.recipient_name}</p>
                                        <p>{order.address_line1}</p>
                                        {order.address_line2 && <p>{order.address_line2}</p>}
                                        <p><span className="font-semibold">연락처:</span> {order.phone_number}</p>
                                    </>
                                ) : <p>배송지 정보가 없습니다.</p>}
                            </div>
                        </div>

                        <h3 className="text-lg font-bold mb-2">주문 상품</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>이미지</TableHead>
                                    <TableHead>상품명</TableHead>
                                    <TableHead>색상</TableHead>
                                    <TableHead>단가</TableHead>
                                    <TableHead>수량</TableHead>
                                    <TableHead>금액</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {order.order_products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            {product.product_image ? (
                                                <img
                                                    src={product.product_image}
                                                    alt={product.product_name || '상품 이미지'}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded">
                                                    No Image
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>{product.product_name || '-'}</TableCell>
                                        <TableCell>
                                            {product.color && (
                                                <div className="flex items-center">
                                                    {product.color_code && (
                                                        <div
                                                            className="w-4 h-4 rounded-full mr-2"
                                                            style={{ backgroundColor: product.color_code }}
                                                        />
                                                    )}
                                                    {product.color}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>₩{product.price.toLocaleString()}</TableCell>
                                        <TableCell>{product.quantity}</TableCell>
                                        <TableCell>₩{(product.price * product.quantity).toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <div className="mt-4 text-right">
                            <p className="text-xl font-bold">총 주문금액: ₩{order.total_amount.toLocaleString()}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}