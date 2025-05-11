'use server';

import { createClient } from "@/utils/server";
import {revalidatePath} from "next/cache";

export async function getOrdersProduct(id: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                message: '로그인이 필요합니다.'
            };
        }

        // 주문 기본 정보 조회
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();

        if (orderError || !order) {
            console.error('주문 조회 실패:', orderError);
            return {
                success: false,
                message: '주문 정보를 찾을 수 없습니다.'
            };
        }

        // 주소 정보 별도 조회
        const { data: addressData, error: addressError } = await supabase
            .from('addresses')
            .select('recipient_name, phone_number, address_line1, address_line2')
            .eq('id', order.address_id)
            .single();

        if (addressError) {
            console.error('주소 조회 실패:', addressError);
            // 주소 조회에 실패해도 주문 정보는 반환
        }

        // 주문 상품 정보 조회
        const { data: orderProducts, error: productsError } = await supabase
            .from('order_products')
            .select(`
                *,
                product:products(*),
                variant:product_variants(*)
            `)
            .eq('order_id', id);

        if (productsError) {
            console.error('주문 상품 조회 실패:', productsError);
            return {
                success: false,
                message: '주문 상품 정보를 조회하는데 실패했습니다.'
            };
        }

        return {
            success: true,
            data: {
                ...order,
                address: addressData || null,
                products: orderProducts || []
            }
        };
    } catch (error) {
        console.error('주문 조회 중 오류 발생:', error);
        return {
            success: false,
            message: '주문 정보를 조회하는데 실패했습니다.'
        };
    }
}
export async function updateOrderPayment(orderId: string, paymentInfo: {
    paymentMethod?: string;
    receiptId?: string;
    paymentData?: any;
}) {
    try {
        const supabase = await createClient();

        console.log('주문 결제 정보 업데이트 시작:', orderId);
        console.log('결제 정보:', paymentInfo);

        // 결제 정보와 주문 상태 업데이트
        const { data, error } = await supabase
            .from('orders')
            .update({
                payment_status: 'paid', // 결제 완료로 상태 변경
                payment_method: paymentInfo.paymentMethod || '카드', // 결제 방법 업데이트
                order_status: 'processing', // 주문 상태를 처리 중으로 변경
                updated_at: new Date().toISOString(), // 업데이트 시간 갱신
                // 필요한 경우 receipt_id나 다른 결제 관련 데이터 저장
                // 테이블에 추가 필드가 있다면 여기에 추가
            })
            .eq('id', orderId)
            .select()
            .single();

        if (error) {
            console.error('주문 상태 업데이트 실패:', error);
            return {
                success: false,
                message: '결제 정보 업데이트에 실패했습니다: ' + error.message
            };
        }

        // 캐시 무효화 (결제 페이지와 주문 목록 갱신)
        revalidatePath(`/order/payment/${orderId}`);
        revalidatePath('/orders');

        console.log('주문 결제 정보 업데이트 완료:', data);

        return {
            success: true,
            message: '결제가 완료되었습니다.',
            data
        };
    } catch (error: any) {
        console.error('결제 정보 업데이트 중 오류 발생:', error);
        return {
            success: false,
            message: '결제 정보 업데이트 중 오류가 발생했습니다: ' + (error.message || JSON.stringify(error))
        };
    }
}