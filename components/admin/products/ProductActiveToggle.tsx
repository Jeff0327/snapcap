'use client';

import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import useAlert from '@/lib/notiflix/useAlert';
import { ERROR_CODES } from '@/utils/ErrorMessage';
import {toggleActiveStatus} from "@/app/admin/products/edit/[id]/actions";

interface ProductActiveToggleProps {
    productId: string;
    initialActive: boolean;
}

const ProductActiveToggle = ({ productId, initialActive }: ProductActiveToggleProps) => {
    const [isActive, setIsActive] = useState(initialActive);
    const [isUpdating, setIsUpdating] = useState(false);
    const { notify, loading } = useAlert();

    const handleToggle = async (checked: boolean) => {
        setIsUpdating(true);
        loading.start();

        try {
            const result = await toggleActiveStatus(productId, checked);

            if (result.code === ERROR_CODES.SUCCESS) {
                setIsActive(checked);
                notify.success(result.message);
            } else {
                notify.failure(result.message);
                // 토글 실패 시 원래 상태로 되돌림
                setIsActive(!checked);
            }
        } catch (error) {
            console.error('상품 상태 변경 오류:', error);
            notify.failure('상품 상태 변경 중 오류가 발생했습니다.');
            // 토글 실패 시 원래 상태로 되돌림
            setIsActive(!checked);
        } finally {
            setIsUpdating(false);
            loading.remove();
        }
    };

    return (
        <div className="flex items-center space-x-2">
            <div className="relative">
                <Switch
                    id="product_active_toggle"
                    checked={isActive}
                    onCheckedChange={handleToggle}
                    disabled={isUpdating}
                    className="peer h-6 w-11 rounded-full bg-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 data-[state=checked]:bg-blue-600"
                />
                <span className="block absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-data-[state=checked]:translate-x-5"></span>
            </div>
        </div>
    );
};

export default ProductActiveToggle;