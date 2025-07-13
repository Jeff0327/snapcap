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
import {
    formatDate,
    ORDER_STATUS_OPTIONS,
    getStatusLabel,
    getOrderStatusColor,
    getPaymentStatusColor
} from "@/utils/utils";
import { OrderCompleteView } from "@/types";
import FormContainer from "@/components/ui/form";
import {updateOrderStatus} from "@/app/admin/orders/actions";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Button} from "@/components/ui/button";

// 확장된 주문 ID 상태 타입
interface ExpandedOrdersState {
    [key: string]: boolean;
}

export default function OrderList({ orders }: { orders: OrderCompleteView[] }) {
    const [expandedOrders, setExpandedOrders] = useState<ExpandedOrdersState>({});

    const toggleOrderExpand = (orderId: string): void => {
        setExpandedOrders((prev) => ({
            ...prev,
            [orderId]: !prev[orderId],
        }));
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
                                <TableCell className="font-medium">
                                    {order.order_number || order.order_id.slice(0,7)}
                                </TableCell>
                                <TableCell>
                                    {formatDate(order.order_created_at)}
                                </TableCell>
                                <TableCell>{userInfo.name}</TableCell>
                                <TableCell>{userInfo.phone}</TableCell>
                                <TableCell>₩{order.total_amount?.toLocaleString()}</TableCell>
                                <TableCell>{order.items_count || order.order_products.length}</TableCell>

                                {/* 결제상태 - 읽기 전용 (결제는 다른 시스템에서 처리) */}
                                <TableCell>
                                    <Badge className={getPaymentStatusColor(order.payment_status)}>
                                        {getStatusLabel(order.payment_status, 'payment')}
                                    </Badge>
                                </TableCell>

                                {/* 주문상태 - 관리자가 변경 가능 */}
                                <TableCell>
                                    <FormContainer action={updateOrderStatus}>
                                        <input type="hidden" name="orderId" value={order.order_id} />
                                        <div className="flex items-center gap-2">
                                            <Badge className={getOrderStatusColor(order.order_status)}>
                                                {getStatusLabel(order.order_status, 'order')}
                                            </Badge>
                                            <Select name="orderStatus" defaultValue={order.order_status}>
                                                <SelectTrigger className="w-[120px] h-8">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className={'bg-white'}>
                                                    {ORDER_STATUS_OPTIONS.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button type="submit" size="sm" variant="outline">
                                                변경
                                            </Button>
                                        </div>
                                    </FormContainer>
                                </TableCell>

                                <TableCell>
                                    <button
                                        onClick={() => toggleOrderExpand(order.order_id)}
                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
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
                    <div key={`detail-${order.order_id}`} className="mt-2 mb-6 border rounded-md p-4 bg-gray-50 dark:bg-gray-800">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <h3 className="text-lg font-bold mb-2 dark:text-white">주문 정보</h3>
                                <p className="dark:text-gray-300"><span className="font-semibold">주문번호:</span> {order.order_number || order.order_id.slice(0,7)}</p>
                                <p className="dark:text-gray-300"><span className="font-semibold">결제방법:</span> {order.payment_method}</p>
                                <p className="dark:text-gray-300"><span className="font-semibold">결제상태:</span> {getStatusLabel(order.payment_status, 'payment')}</p>
                                <p className="dark:text-gray-300"><span className="font-semibold">주문상태:</span> {getStatusLabel(order.order_status, 'order')}</p>
                                <p className="dark:text-gray-300"><span className="font-semibold">주문일자:</span> {formatDate(order.order_created_at)}</p>
                                {order.notes && <p className="dark:text-gray-300"><span className="font-semibold">메모:</span> {order.notes}</p>}
                            </div>

                            <div>
                                <h3 className="text-lg font-bold mb-2 dark:text-white">고객 정보</h3>
                                <p className="dark:text-gray-300"><span className="font-semibold">이름:</span> {userInfo.name}</p>
                                <p className="dark:text-gray-300"><span className="font-semibold">이메일:</span> {userInfo.email}</p>
                                <p className="dark:text-gray-300"><span className="font-semibold">연락처:</span> {userInfo.phone}</p>

                                <h3 className="text-lg font-bold mt-4 mb-2 dark:text-white">배송지 정보</h3>
                                {order.address_id ? (
                                    <>
                                        <p className="dark:text-gray-300">{order.recipient_name}</p>
                                        <p className="dark:text-gray-300">{order.address_line1}</p>
                                        {order.address_line2 && <p className="dark:text-gray-300">{order.address_line2}</p>}
                                        <p className="dark:text-gray-300"><span className="font-semibold">연락처:</span> {order.phone_number}</p>
                                    </>
                                ) : <p className="dark:text-gray-300">배송지 정보가 없습니다.</p>}
                            </div>
                        </div>

                        <h3 className="text-lg font-bold mb-2 dark:text-white">주문 상품</h3>
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
                                                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 flex items-center justify-center rounded">
                                                    <span className="text-gray-400 dark:text-gray-300 text-xs">No Image</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="dark:text-gray-300">{product.product_name || '-'}</TableCell>
                                        <TableCell>
                                            {product.color && (
                                                <div className="flex items-center">
                                                    {product.color_code && (
                                                        <div
                                                            className="w-4 h-4 rounded-full mr-2"
                                                            style={{ backgroundColor: product.color_code }}
                                                        />
                                                    )}
                                                    <span className="dark:text-gray-300">{product.color}</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="dark:text-gray-300">₩{product.price.toLocaleString()}</TableCell>
                                        <TableCell className="dark:text-gray-300">{product.quantity}</TableCell>
                                        <TableCell className="dark:text-gray-300">₩{(product.price * product.quantity).toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <div className="mt-4 text-right">
                            <p className="text-xl font-bold dark:text-white">총 주문금액: ₩{order.total_amount.toLocaleString()}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}