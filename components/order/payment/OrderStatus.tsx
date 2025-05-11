import React from 'react';

const OrderStatus = ({ status }: { status: string }) => {
    // 상태에 따른 색상
    const getStatusColor = () => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-700';
            case 'paid': return 'bg-green-100 text-green-800';
            case 'shipping': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-purple-100 text-purple-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // 상태에 따른 한국어 텍스트
    const getStatusText = () => {
        switch (status) {
            case 'pending': return '주문 접수';
            case 'processing': return '처리중';
            case 'paid': return '결제 완료';
            case 'shipping': return '배송중';
            case 'completed': return '주문 완료';
            case 'cancelled': return '주문 취소';
            default: return status; // 정의되지 않은 상태는 원래 값 표시
        }
    };

    return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
        </span>
    );
};

export default OrderStatus;