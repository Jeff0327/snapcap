import React from 'react';

type StatusType = 'order' | 'payment';

interface OrderStatusProps {
    status: string;
    type?: StatusType; // 상태 유형: 'order' 또는 'payment'
}

const OrderStatus = ({ status, type = 'order' }: OrderStatusProps) => {
    // 상태에 따른 색상
    const getStatusColor = () => {
        // 주문 상태와 결제 상태에 따라 색상 분리
        if (type === 'payment') {
            // 결제 상태에 대한 색상
            switch (status) {
                case 'pending': return 'bg-yellow-100 text-yellow-800';
                case 'paid': return 'bg-green-100 text-green-800';
                case 'failed': return 'bg-red-100 text-red-800';
                case 'refunded': return 'bg-orange-100 text-orange-800';
                default: return 'bg-gray-100 text-gray-800';
            }
        } else {
            // 주문 상태에 대한 색상
            switch (status) {
                case 'pending': return 'bg-blue-50 text-blue-600';
                case 'processing': return 'bg-blue-100 text-blue-700';
                case 'shipping': return 'bg-indigo-100 text-indigo-800';
                case 'completed': return 'bg-purple-100 text-purple-800';
                case 'cancelled': return 'bg-red-100 text-red-800';
                case 'returned': return 'bg-orange-100 text-orange-800';
                default: return 'bg-gray-100 text-gray-800';
            }
        }
    };

    // 상태에 따른 한국어 텍스트
    const getStatusText = () => {
        // 주문 상태와 결제 상태에 따라 텍스트 분리
        if (type === 'payment') {
            // 결제 상태에 대한 텍스트
            switch (status) {
                case 'pending': return '결제 전';
                case 'paid': return '결제 완료';
                case 'failed': return '결제 실패';
                case 'refunded': return '환불 완료';
                default: return status;
            }
        } else {
            // 주문 상태에 대한 텍스트
            switch (status) {
                case 'pending': return '주문 접수';
                case 'processing': return '처리중';
                case 'shipping': return '배송중';
                case 'completed': return '배송 완료';
                case 'cancelled': return '주문 취소';
                case 'returned': return '반품 완료';
                default: return status;
            }
        }
    };

    return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
        </span>
    );
};

export default OrderStatus;