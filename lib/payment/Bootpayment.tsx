'use client';

import { useState } from 'react';
import { Bootpay } from '@bootpay/client-js';
import {useLoading} from "@/components/layout/LoadingProvider";

interface PaymentItem {
    id: string;
    name: string;
    qty: number;
    price: number;
}

interface UserInfo {
    id?: string;
    username?: string;
    phone?: string;
    email?: string;
}

interface BootpayPaymentProps {
    applicationId: string;  // 부트페이 애플리케이션 ID
    price: number;          // 결제 금액
    orderName: string;      // 주문명
    orderId: string;        // 주문 ID
    pg?: string;            // PG사 (기본값: '다날')
    method?: string;        // 결제 수단 (기본값: '카드')
    taxFree?: number;       // 면세 금액
    user?: UserInfo;        // 유저 정보
    items?: PaymentItem[];  // 주문 아이템
    cardQuota?: string;     // 할부 개월 수
    escrow?: boolean;       // 에스크로 사용 여부
    openType?: string;      // 결제창 타입
    onSuccess?: (data: any) => void;  // 결제 성공 시 콜백
    onFailure?: (data: any) => void;  // 결제 실패 시 콜백
    onCancel?: (data: any) => void;   // 결제 취소 시 콜백
    onConfirm?: (data: any) => Promise<boolean>;  // 결제 승인 전 콜백
    onDone?: () => void;    // 결제 완료 시 콜백
    className?: string;     // 버튼 CSS 클래스
    buttonText?: string;    // 버튼 텍스트
    disabled?: boolean;     // 버튼 비활성화 여부
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
                            onConfirm,
                            onDone,
                            className = 'w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md',
                            buttonText = '결제하기',
                            disabled = false
                        }: BootpayPaymentProps) => {

const {showLoading,hideLoading,isLoading} = useLoading();
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
                if (onSuccess) onSuccess(response);
            }
            // 결제 실패
            else if (response.event === 'error') {
                if (onFailure) onFailure(response);
            }
            // 결제 취소
            else if (response.event === 'cancel') {
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