'use client';

import { Bootpay } from '@bootpay/client-js';
import { useLoading } from "@/components/layout/LoadingProvider";
import {BootpayPaymentProps} from "@/types";
import {createOrder} from "@/app/(main)/order/actions";
import {ERROR_CODES} from "@/utils/ErrorMessage";

const BootpayPayment = ({
                            applicationId,
                            price,
                            orderName,
                            orderId,
                            method = '카드',
                            taxFree = 0,
                            user,
                            items = [],
                            cardQuota = '0,2,3',
                            escrow = false,
                            openType = 'iframe',
                            onSuccess,
                            onFailure,
                            onCancel,
                            formData,
                            onConfirm,
                            onDone,
                            className = 'w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md',
                            buttonText = '결제하기',
                            disabled = false
                        }: BootpayPaymentProps) => {

    const {showLoading, hideLoading, isLoading} = useLoading();

    const handlePayment = async () => {
        try {
            showLoading();

            const response = await Bootpay.requestPayment({
                application_id: applicationId,
                price,
                order_name: orderName,
                order_id: orderId,
                method,
                tax_free: taxFree,
                user: user || {
                    id: '',
                    username: '',
                    phone: '',
                    email: ''
                },
                items: items.length > 0 ? items : [
                    {
                        id: 'default_item',
                        name: orderName,
                        qty: 1,
                        price
                    }
                ],
                extra: {
                    open_type: openType,
                    card_quota: cardQuota,
                    escrow
                }
            });

            console.log('this is',response)
            // 결제 성공
            if (response.event === 'done') {
                // 주문 데이터베이스에 저장
                try {
                    const result = await createOrder(formData);
                    if (result.code===ERROR_CODES.SUCCESS) {
                        console.log('Order created successfully');
                        if (onSuccess) onSuccess(response);
                    } else {
                        console.error('Failed to create order:', result.message);
                        if (onFailure) onFailure({
                            error: result.message,
                            code: result.code
                        });
                    }
                } catch (orderError) {
                    console.error('Failed to create order:', orderError);
                    if (onFailure) onFailure(orderError);
                }
            }
            // 결제 실패
            else if (response.event === 'error') {
                if (onFailure) onFailure(response);
            }
            // 결제 취소
            else if (response.event === 'cancel') {
                // 결제 취소 시에는 orders 테이블에 주문 정보 추가 (테스트용)
                console.log("결제취소")
                try {
                    // 결제 취소 시에도 주문을 생성 (테스트용)
                    const result = await createOrder(formData);
                    if (result.code === ERROR_CODES.SUCCESS) {
                        console.log('Cancelled order recorded for testing');
                    } else {
                        console.error('Failed to create cancelled order:', result.message);
                    }

                    if (onCancel) onCancel(response);
                } catch (orderError) {
                    console.error('Failed to create cancelled order:', orderError);
                }

                return;
            }

            // 결제 완료 콜백
            if (onDone) onDone();

        } catch (error) {
            if (onFailure) onFailure(error);
        } finally {
            hideLoading();
        }
    };

    // 결제 진행 중 확인 콜백 설정
    if (onConfirm) {
        (Bootpay as any).setConfirmMethod(onConfirm);
    }

    return (
        <button
            type="button"
            className={className}
            onClick={handlePayment}
            disabled={disabled || isLoading}
        >
            {isLoading ? '처리 중...' : buttonText}
        </button>
    );
};

export default BootpayPayment;