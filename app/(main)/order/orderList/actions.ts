// app/(main)/orders/actions.ts
'use server';

import { createClient } from "@/utils/server";
import {Orders} from "@/types";

// 사용자의 주문 목록 조회
export async function getUserOrders(userId: string) {
    try {
        const supabase = await createClient();

        const { data: orders, error } = await supabase
            .from('orders')
            .select(`
        id,
        created_at,
        total_amount,
        order_status,
        payment_status,
        items_count,
        primary_product_name,
        primary_product_image
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('주문 목록 조회 실패:', error);
            throw new Error('주문 목록을 불러오는데 실패했습니다.');
        }

        return orders || [];
    } catch (error) {
        console.error('주문 목록 조회 중 오류 발생:', error);
        throw new Error('주문 목록을 불러오는데 실패했습니다.');
    }
}

// 특정 주문 상세 정보 조회
export async function getOrderDetail(orderId: string, userId: string) {
    try {
        const supabase = await createClient();

        // 주문 기본 정보 조회
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select(`
        id,
        created_at,
        updated_at,
        total_amount,
        order_status,
        payment_status,
        payment_method,
        address:addresses(
          recipient_name,
          phone_number,
          address_line1,
          address_line2
        )
      `)
            .eq('id', orderId)
            .eq('user_id', userId) // 본인 주문만 조회 가능하도록
            .single();

        if (orderError || !order) {
            console.error('주문 상세 조회 실패:', orderError);
            throw new Error('주문 정보를 불러오는데 실패했습니다.');
        }

        // 주문 상품 정보 조회
        const { data: orderProducts, error: productsError } = await supabase
            .from('order_products')
            .select(`
        id,
        product_name,
        product_image,
        variant_name,
        quantity,
        price,
        original_price,
        color,
        color_code
      `)
            .eq('order_id', orderId);

        if (productsError) {
            console.error('주문 상품 조회 실패:', productsError);
            throw new Error('주문 상품 정보를 불러오는데 실패했습니다.');
        }

        // 최종 주문 상세 정보 구성
        return {
            ...order,
            items: orderProducts || []
        };

    } catch (error) {
        console.error('주문 상세 조회 중 오류 발생:', error);
        throw new Error('주문 정보를 불러오는데 실패했습니다.');
    }
}