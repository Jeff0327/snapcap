'use client';

import React, { useState } from 'react';
import BootpayPayment from "@/lib/payment/Bootpayment";
import { useRouter } from "next/navigation";
import useAlert from "@/lib/notiflix/useAlert";
import { updateOrderPayment, validateInventoryBeforePayment } from "@/app/(main)/order/payment/[id]/actions";
import {ERROR_CODES} from "@/utils/ErrorMessage";

interface PaymentButtonProps {
    order: any;
    user: any;
    disabled?: boolean; // 🎯 재고 확인으로 인한 비활성화 상태
}

const PaymentButton = ({ order, user, disabled = false }: PaymentButtonProps) => {
    const { notify } = useAlert();
    const router = useRouter();
    const [paymentProcessing, setPaymentProcessing] = useState(false);

    // 결제 상태가 대기 중이 아니면 버튼을 표시하지 않음
    if (order.payment_status !== 'pending') return null;

    // 🎯 품절로 인해 비활성화된 경우
    if (disabled) {
        return (
            <div className="mt-6 bg-gray-50 rounded-lg p-6 text-center">
                <button
                    disabled
                    className="w-full bg-gray-300 text-gray-500 font-bold py-4 px-6 rounded-lg cursor-not-allowed"
                >
                    품절로 인해 결제할 수 없습니다
                </button>
                <p className="text-sm text-gray-600 mt-2">
                    장바구니에서 품절된 상품을 제거하거나 수량을 조정해주세요.
                </p>
            </div>
        );
    }

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

    // 🎯 수정된 주문 업데이트 핸들러 - 재고 확인 포함
    const handleOrderUpdate = async (paymentOrderId: string, paymentData: any) => {
        try {
            console.log('💰 결제 처리 시작 - 재고 재확인');

            // 1단계: 결제 전 재고 재확인
            const inventoryValidation = await validateInventoryBeforePayment(order.id);

            if (inventoryValidation.code !== ERROR_CODES.SUCCESS) {
                console.error('❌ 재고 확인 실패:', inventoryValidation.message);
                throw new Error(inventoryValidation.message);
            }

            console.log('✅ 재고 확인 완료 - 결제 처리 진행');

            // 2단계: 실제 주문 업데이트 (재고 차감 포함)
            const updateResult = await updateOrderPayment(order.id, paymentData);

            if (!updateResult.success) {
                throw new Error(updateResult.message || '주문 업데이트에 실패했습니다.');
            }

            console.log('✅ 주문 업데이트 완료:', updateResult);

            // 재고 차감 결과 로깅
            if (updateResult.data?.inventory_deduction) {
                console.log('📦 재고 차감 결과:', updateResult.data.inventory_deduction);
            }

            return updateResult;

        } catch (error: any) {
            console.error('❌ 주문 업데이트 중 오류:', error);
            throw error; // 에러를 다시 던져서 결제 프로세스가 중단되도록 함
        }
    };

    // 결제 성공 처리
    const handlePaymentSuccess = async (data: any) => {
        try {
            setPaymentProcessing(true);
            console.log('✅ 결제 성공:', data);

            // 결과 확인
            if (data.updateResult && data.updateResult.success) {
                notify.success('결제가 완료되었습니다.');

                // 재고 차감 성공 메시지 추가
                if (data.updateResult.data?.inventory_deduction?.success) {
                    const updatedProducts = data.updateResult.data.inventory_deduction.updates.length;
                    console.log(`📦 ${updatedProducts}개 상품의 재고가 차감되었습니다.`);
                }

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
            console.error('❌ 결제 처리 중 오류:', error);
            notify.failure('결제 처리 중 오류가 발생했습니다.');
        } finally {
            setPaymentProcessing(false);
        }
    };

    // 🎯 수정된 결제 실패 처리 - 재고 관련 에러 메시지 포함
    const handlePaymentFailure = (data: any) => {
        if (data.event === "cancel") return;

        console.error('❌ 결제 실패:', data);

        // 재고 관련 에러인지 확인
        if (data.error && data.error.includes('품절')) {
            notify.failure('상품이 품절되어 결제할 수 없습니다. 페이지를 새로고침해주세요.');
            setTimeout(() => {
                window.location.reload(); // 재고 상태 다시 확인
            }, 2000);
        } else {
            notify.failure('결제에 실패했습니다. 다시 시도해주세요.');
        }
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
            {/* 🎯 재고 확인 안내 메시지 */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-blue-800">
                        💡 결제 진행 시 상품 재고를 다시 한 번 확인합니다.
                    </p>
                </div>
            </div>

            <BootpayPayment
                applicationId={process.env.NEXT_PUBLIC_BOOTPAY_KEY!}
                price={order.total_amount}
                orderName={getOrderName()}
                orderId={orderId}
                method="카드"
                user={userInfo}
                items={orderItems}
                formData={getFormData()}
                onOrderUpdate={handleOrderUpdate} // 🎯 재고 확인이 포함된 핸들러
                onSuccess={handlePaymentSuccess}
                onFailure={handlePaymentFailure} // 🎯 재고 관련 에러 처리 포함
                onCancel={handlePaymentCancel}
                disabled={paymentProcessing}
                buttonText={paymentProcessing ? "결제 처리 중..." : "결제 진행하기"}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
            />

            <p className="text-xs text-gray-500 mt-2 text-center">
                결제하기 버튼을 클릭하면 구매조건에 동의하는 것으로 간주합니다.
            </p>

            {/* 🎯 재고 관련 추가 안내 */}
            <div className="mt-2 text-xs text-gray-400 text-center">
                상품 재고는 결제 시점에 최종 확인되며, 품절 시 결제가 취소됩니다.
            </div>
        </div>
    );
};

export default PaymentButton;