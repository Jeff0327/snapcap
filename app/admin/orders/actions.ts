'use server';

import { OrdersResponse, OrderCompleteView } from "@/types";
import { AdminClient } from "@/utils/adminClient";
import {FormState} from "@/components/ui/form";
import {createClient} from "@/utils/server";
import {ERROR_CODES} from "@/utils/ErrorMessage";
import {revalidatePath} from "next/cache";

export async function getOrderList(): Promise<OrdersResponse> {
    const supabase = AdminClient();
    try {
        // orders_complete_view를 사용하여 모든 주문 정보를 한 번에 가져옴
        const { data: orders, error } = await supabase
            .from('orders_complete_view')
            .select('*')
            .order('order_created_at', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
            return { orders: [], error: error.message };
        }

        return {
            orders: orders as OrderCompleteView[],
            error: null
        };
    } catch (error: any) {
        console.error('Unexpected error:', error);
        return { orders: [], error: 'An unexpected error occurred' };
    }
}

export async function getOrderDetail(orderId: string): Promise<{ order: OrderCompleteView | null, error: string | null }> {
    const supabase = AdminClient();
    try {
        // 특정 주문의 상세 정보 조회
        const { data: order, error } = await supabase
            .from('orders_complete_view')
            .select('*')
            .eq('order_id', orderId)
            .single();

        if (error) {
            console.error('Error fetching order detail:', error);
            return { order: null, error: error.message };
        }

        return {
            order: order as OrderCompleteView,
            error: null
        };
    } catch (error: any) {
        console.error('Unexpected error:', error);
        return { order: null, error: 'An unexpected error occurred' };
    }
}
async function sendShippingNotification(orderData: OrderCompleteView) {
    try {
        const apiUrl = process.env.NODE_ENV === 'development'
            ? 'http://localhost:3000/api/twilio/shipping'
            : `${process.env.NEXT_PUBLIC_BASE_URL}/api/twilio/shipping`;

        const smsData = {
            primary_product_name: orderData.primary_product_name || '상품',
            items_count: orderData.items_count || 1,
            total_amount: orderData.total_amount || 0,
            order_number: orderData.order_number || orderData.order_id.slice(0, 8),
            // 고객 정보
            customer_name: orderData.customer_name || orderData.user_email?.split('@')[0] || '고객',
            customer_phone: orderData.customer_phone || orderData.phone_number || '',
            // 배송 정보
            recipient_name: orderData.recipient_name || orderData.customer_name || '고객',
            phone_number: orderData.phone_number || orderData.customer_phone || '',
            address_line1: orderData.address_line1 || '',
            address_line2: orderData.address_line2 || '',
            total_quantity: orderData.items_count || 1
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.API_SECRET!,
            },
            body: JSON.stringify(smsData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('발송 완료 SMS 전송 실패:', errorData);
            return false;
        }

        const result = await response.json();
        return true;
    } catch (error) {
        console.error('❌ 발송 완료 SMS 전송 중 오류:', error);
        return false;
    }
}
export async function updateOrderStatus(formData: FormData): Promise<FormState> {
    try {
        const supabase = await createClient();

        // 폼 데이터에서 값 추출
        const orderId = formData.get('orderId') as string;
        const newStatus = formData.get('orderStatus') as string;

        if (!orderId || !newStatus) {
            return {
                code: ERROR_CODES.VALIDATION_ERROR,
                message: '필수 정보가 누락되었습니다.'
            };
        }

        // 현재 사용자가 관리자인지 확인
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return {
                code: ERROR_CODES.AUTH_ERROR,
                message: '로그인이 필요합니다.'
            };
        }

        // 관리자 권한 확인
        if (user.user_metadata?.role !== 'admin') {
            return {
                code: ERROR_CODES.FORBIDDEN,
                message: '관리자 권한이 필요합니다.'
            };
        }

        // 🚚 처리 완료 상태로 변경되는 경우, SMS 알림을 위해 주문 정보 먼저 조회
        let shouldSendSMS = false;
        let orderData: OrderCompleteView | null = null;

        if (newStatus === 'completed') {
            const { order, error: orderError } = await getOrderDetail(orderId);
            if (!orderError && order) {
                orderData = order;
                shouldSendSMS = true;
            }
        }

        // 주문 상태 업데이트
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                order_status: newStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId);

        if (updateError) {
            console.error('주문 상태 업데이트 오류:', updateError);
            return {
                code: ERROR_CODES.DB_ERROR,
                message: '주문 상태 업데이트에 실패했습니다.'
            };
        }

        // 🚚 처리 완료 상태로 변경된 경우, 고객에게 발송 완료 SMS 전송
        if (shouldSendSMS && orderData) {
            // SMS 전송은 비동기로 처리 (실패해도 주문 상태 업데이트는 성공으로 처리)
            sendShippingNotification(orderData).then((success) => {
                if (!success) {
                    console.error(`❌ 주문 ${orderId} 발송 완료 SMS 전송 실패`);
                }
            });
        }

        // 페이지 캐시 재검증
        revalidatePath('/admin/orders');

        const successMessage = newStatus === 'completed'
            ? '주문이 처리 완료되었으며, 고객에게 발송 완료 알림이 전송됩니다.'
            : '주문 상태가 성공적으로 업데이트되었습니다.';

        return {
            code: ERROR_CODES.SUCCESS,
            message: successMessage
        };

    } catch (error) {
        console.error('주문 상태 업데이트 오류:', error);
        return {
            code: ERROR_CODES.SERVER_ERROR,
            message: '서버 오류가 발생했습니다.'
        };
    }
}