// BootpayPayment.tsx 수정
'use client';

import { Bootpay } from '@bootpay/client-js';
import { useLoading } from "@/components/layout/LoadingProvider";
import { BootpayPaymentProps } from "@/types";

interface ExtendedBootpayPaymentProps extends BootpayPaymentProps {
    // 주문 업데이트 함수를 프롭스로 받음
    onOrderUpdate?: (orderId: string, paymentData: any) => Promise<any>;
}

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
                            onOrderUpdate, // 새로운 프롭
                            onConfirm,
                            onDone,
                            className = 'w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md',
                            buttonText = '결제하기',
                            disabled = false
                        }: ExtendedBootpayPaymentProps) => {

    const { showLoading, hideLoading, isLoading } = useLoading();

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

            // 결제 성공
            if (response.event === 'done') {
                let updateResult;

                // 주문 업데이트 함수가 제공되었다면 호출
                if (onOrderUpdate) {
                    try {
                        // 주문 ID와 결제 데이터를 전달
                        updateResult = await onOrderUpdate(orderId, {
                            paymentMethod: response.data.method || '카드',
                            receiptId: response.data.receipt_id,
                            paymentData: response.data
                        });

                    } catch (updateError) {
                        console.error('주문 상태 업데이트 실패:', updateError);
                        updateResult = { success: false, error: updateError };
                    }
                }

                // 성공 콜백 호출
                if (onSuccess) {
                    onSuccess({
                        ...response,
                        updateResult // 업데이트 결과 포함
                    });
                }
            }
            // 결제 실패
            else if (response.event === 'error') {
                if (onFailure) onFailure(response);
            }
            // 결제 취소
            else if (response.event === 'cancel') {
                if (onCancel) onCancel(response);
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