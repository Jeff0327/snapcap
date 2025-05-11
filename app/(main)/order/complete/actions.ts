// app/(main)/orders/actions.ts
'use server';

import { createClient } from "@/utils/server";
import { Orders } from "@/types";

export async function getUserOrders() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                message: '로그인이 필요합니다.'
            };
        }

        // 1. 연결된 계정 조회 시도
        let relatedUserIds = [user.id];

        try {
            // linked_accounts 테이블이 있는지 확인
            const { error: tableCheckError } = await supabase
                .from('linked_accounts')
                .select('id')
                .limit(1);

            if (!tableCheckError) {
                // 테이블이 있으면 연결된 계정 조회
                const { data: linkedAccounts } = await supabase
                    .from('linked_accounts')
                    .select('linked_user_id')
                    .eq('primary_user_id', user.id);

                // 역방향 연결도 조회
                const { data: reverseLinks } = await supabase
                    .from('linked_accounts')
                    .select('primary_user_id')
                    .eq('linked_user_id', user.id);

                // 연결된 계정 ID 추가
                if (linkedAccounts && linkedAccounts.length > 0) {
                    relatedUserIds = [...relatedUserIds, ...linkedAccounts.map(link => link.linked_user_id)];
                }

                if (reverseLinks && reverseLinks.length > 0) {
                    relatedUserIds = [...relatedUserIds, ...reverseLinks.map(link => link.primary_user_id)];
                }
            }
        } catch (error) {
            console.error('연결된 계정 조회 오류:', error);
            // 오류가 발생해도 계속 진행
        }

        // 2. 전화번호 기반 연결 시도 (대체 방법)
        try {
            // 현재 사용자의 전화번호 조회
            const { data: currentCustomer } = await supabase
                .from('customers')
                .select('phone')
                .eq('user_id', user.id)
                .single();

            const phoneNumber = currentCustomer?.phone;

            if (phoneNumber) {
                // 동일한 전화번호를 가진 고객 찾기
                const { data: relatedCustomers } = await supabase
                    .from('customers')
                    .select('user_id')
                    .eq('phone', phoneNumber)
                    .neq('user_id', user.id);

                if (relatedCustomers && relatedCustomers.length > 0) {
                    const phoneUserIds = relatedCustomers.map(c => c.user_id);
                    relatedUserIds = [...relatedUserIds, ...phoneUserIds];
                }
            }
        } catch (error) {
            console.error('전화번호 기반 연결 오류:', error);
            // 오류가 발생해도 계속 진행
        }

        // 중복 제거
        relatedUserIds = [...new Set(relatedUserIds)];

        console.log('조회할 사용자 ID 목록:', relatedUserIds);

        // 3. 모든 관련 계정의 주문 조회
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .in('user_id', relatedUserIds)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('주문 목록 조회 실패:', error);
            return {
                success: false,
                message: '주문 목록을 불러오는데 실패했습니다.'
            };
        }

        console.log('조회된 주문 수:', orders?.length || 0);

        return {
            success: true,
            data: orders as Orders[] || []
        };
    } catch (error) {
        console.error('주문 목록 조회 중 오류 발생:', error);
        return {
            success: false,
            message: '주문 목록을 불러오는데 실패했습니다.'
        };
    }
}

// 추가적으로 필요한 경우 특정 주문의 상세 정보를 가져오는 함수
export async function getOrderDetail(orderId: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                message: '로그인이 필요합니다.'
            };
        }

        // 주문 정보 조회
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select(`
                *,
                address:addresses(
                    recipient_name,
                    phone_number,
                    address_line1,
                    address_line2
                )
            `)
            .eq('id', orderId)
            .eq('user_id', user.id) // 본인 주문만 조회
            .single();

        if (orderError || !order) {
            console.error('주문 조회 실패:', orderError);
            return {
                success: false,
                message: '주문 정보를 찾을 수 없습니다.'
            };
        }

        // 주문 상품 정보 조회
        const { data: orderProducts, error: productsError } = await supabase
            .from('order_products')
            .select(`
                *,
                product:products(*),
                variant:product_variants(*)
            `)
            .eq('order_id', orderId);

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
                products: orderProducts || []
            }
        };
    } catch (error) {
        console.error('주문 상세 조회 중 오류 발생:', error);
        return {
            success: false,
            message: '주문 정보를 조회하는데 실패했습니다.'
        };
    }
}