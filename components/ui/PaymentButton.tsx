'use client';

import React, { useState } from 'react';
import BootpayPayment from "@/lib/payment/Bootpayment";
import { useRouter } from "next/navigation";
import useAlert from "@/lib/notiflix/useAlert";
import { updateOrderPayment } from "@/app/(main)/order/payment/[id]/actions";

interface PaymentButtonProps {
    order: any;
    user: any;
}

const PaymentButton = ({ order, user }: PaymentButtonProps) => {
    const { notify } = useAlert();
    const router = useRouter();
    const [paymentProcessing, setPaymentProcessing] = useState(false);

    // 결제 상태가 대기 중이 아니면 버튼을 표시하지 않음
    if (order.payment_status !== 'pending') return null;

    // 주문번호 생성 (없을 경우 임시 ID 생성)
    const orderId = order.order_number || `ORDER_${order.id}_${new Date().getTime()}`;

    // 주문 상품 정보를 부트페이 형식으로 변환
    const orderItems = order.products.map((item: any) => ({
        id: item.product_id || item.id,
        name: item.product_name,
        qty: item.quantity,
        price: item.price
    }));

    // 주문자 정보 설정
    const userInfo = {
        id: user?.id || 'guest',
        username: order.address?.recipient_name || '',
        phone: order.address?.phone_number || '',
        email: user?.email || ''
    };

    // 주문명 설정
    const getOrderName = () => {
        if (order.primary_product_name) return order.primary_product_name;

        const firstProduct = order.products[0]?.product_name;
        if (!firstProduct) return '상품 주문';

        return order.products.length > 1
            ? `${firstProduct} 외 ${order.products.length - 1}건`
            : firstProduct;
    };

    // 주문 업데이트 핸들러
    const handleOrderUpdate = async (paymentOrderId: string, paymentData: any) => {
        // 실제 주문 ID 사용 (orderId는 결제용 식별자로 사용되므로, 실제 DB의 order.id 사용)
        return await updateOrderPayment(order.id, paymentData);
    };

    // 결제 성공 처리
    const handlePaymentSuccess = async (data: any) => {
        try {
            setPaymentProcessing(true);
            console.log('결제 성공:', data);

            // 결과 확인
            if (data.updateResult && data.updateResult.success) {
                notify.success('결제가 완료되었습니다.');
                router.push(`/order/complete/${order.id}`);
            } else if (data.updateResult && !data.updateResult.success) {
                // 결제는 성공했지만 주문 상태 업데이트 실패
                notify.warning('결제는 완료되었으나 주문 상태 업데이트에 실패했습니다. 주문 내역을 확인해주세요.');
                router.push(`/orders`);
            } else {
                // 일반적인 성공 케이스
                notify.success('결제가 완료되었습니다.');
                router.push(`/order/complete/${order.id}`);
            }
        } catch (error) {
            console.error('결제 처리 중 오류:', error);
            notify.failure('결제 처리 중 오류가 발생했습니다.');
        } finally {
            setPaymentProcessing(false);
        }
    };

    // 결제 실패 처리
    const handlePaymentFailure = (data: any) => {
        if (data.event === "cancel") return;
        notify.failure('결제에 실패했습니다. 다시 시도해주세요.');
        console.error('결제 실패:', data);
    };

    // 결제 취소 처리
    const handlePaymentCancel = (data: any) => {
        console.log('결제 취소:', data);
        notify.warning('결제가 취소되었습니다.');
    };

    // 더미 formData 생성 (타입 검사 통과용, 실제로는 사용하지 않음)
    const getFormData = () => {
        const formData = new FormData();
        formData.append('orderId', order.id);
        return formData;
    };

    return (
        <div className="mt-6">
            <BootpayPayment
                applicationId={process.env.NEXT_PUBLIC_BOOTPAY_KEY!}
                price={order.total_amount}
                orderName={getOrderName()}
                orderId={orderId}
                method="카드"
                user={userInfo}
                items={orderItems}
                formData={getFormData()}  // 타입 검사 통과를 위해 더미 formData 제공
                onOrderUpdate={handleOrderUpdate} // 주문 업데이트 핸들러 전달
                onSuccess={handlePaymentSuccess}
                onFailure={handlePaymentFailure}
                onCancel={handlePaymentCancel}
                disabled={paymentProcessing}
                buttonText={paymentProcessing ? "처리 중..." : "결제 진행하기"}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md"
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
                결제하기 버튼을 클릭하면 구매조건에 동의하는 것으로 간주합니다.
            </p>
        </div>
    );
};

export default PaymentButton;