import React from 'react';
import { getStatusLabel, getOrderStatusColor, getPaymentStatusColor } from '@/utils/utils';

type StatusType = 'order' | 'payment';

interface OrderStatusProps {
    status: string;
    type?: StatusType;
    className?: string;
}

const OrderStatus = ({ status, type = 'order', className = '' }: OrderStatusProps) => {
    const statusText = getStatusLabel(status, type);
    const statusColor = type === 'order'
        ? getOrderStatusColor(status)
        : getPaymentStatusColor(status);

    return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor} ${className}`}>
            {statusText}
        </span>
    );
};

export default OrderStatus;