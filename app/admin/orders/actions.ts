'use server';

import { OrdersResponse, OrderCompleteView } from "@/types";
import { AdminClient } from "@/utils/adminClient";

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