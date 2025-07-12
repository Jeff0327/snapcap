// app/(main)/cart/actions.ts
'use server';

import { createClient } from "@/utils/server";
import { CartItem } from "@/types";
import {revalidatePath} from "next/cache";

// app/(main)/cart/actions.ts (수정된 getCartItems 부분)
// app/(main)/cart/actions.ts (관계 명시를 통해 수정된 getCartItems 함수)
export async function getCartItems(userId: string): Promise<CartItem[]> {
    if (!userId) return [];

    try {
        const supabase = await createClient();

        // 장바구니 항목 조회 - 명시적 관계 지정으로 JOIN 수행
        const { data: cartData, error: cartError } = await supabase
            .from('carts')
            .select(`
                id,
                user_id,
                product_id,
                variant_id, 
                quantity,
                color,
                color_code,
                created_at,
                updated_at,
                product:products!inner(
                    id, 
                    name, 
                    price, 
                    sale_price, 
                    images, 
                    inventory, 
                    is_active
                ),
                product_variant:product_variants!carts_variant_id_fkey!inner(
                    id, 
                    product_id, 
                    color, 
                    color_code, 
                    inventory, 
                    is_active
                )
            `)
            .eq('user_id', userId);

        if (cartError) {
            console.error('장바구니 조회 오류:', cartError);
            throw new Error('장바구니 목록을 불러오는데 실패했습니다.');
        }

        // 활성화된 상품/변형만 필터링 (데이터베이스 필터 후 추가 검증)
        const validCartItems = (cartData || []).filter(item =>
            item.product &&
            item.product_variant &&
            item.product.is_active !== false &&
            item.product_variant.is_active !== false
        );

        // 필요한 경우 재고 체크와 같은 비즈니스 로직 처리
        const cartItems: CartItem[] = validCartItems.map(item => {
            const product = item.product!; // 필터링되었으므로 존재함
            const variant = item.product_variant!; // 필터링되었으므로 존재함

            // 재고 체크 및 경고 (선택 사항)
            if (product.inventory <= 0) {
                console.warn(`장바구니 상품 재고 없음: ${item.id}, 상품: ${product.name}`);
            }

            if (variant.inventory <= 0) {
                console.warn(`장바구니 variant 재고 없음: ${item.id}, 색상: ${variant.color}`);
            }

            // CartItem 타입에 맞는 객체 반환
            // null 값을 빈 문자열로 변환하여 타입 오류 방지
            const cartItem: CartItem = {
                id: item.id,
                user_id: item.user_id,
                product_id: item.product_id,
                variant_id: item.variant_id,
                quantity: item.quantity,
                color: item.color || '', // null일 경우 빈 문자열로 변환
                color_code: item.color_code || '', // null일 경우 빈 문자열로 변환
                created_at: item.created_at ||'',
                updated_at: item.updated_at || '',
                product: {
                    id: product.id,
                    name: product.name || '', // null일 경우 빈 문자열로 변환
                    price: product.price || 0, // null일 경우 0으로 변환
                    sale_price: product.sale_price,
                    images: product.images || [], // null일 경우 빈 배열로 변환
                    inventory: product.inventory || 0, // null일 경우 0으로 변환
                    is_active: product.is_active !== false // undefined일 경우 true로 변환
                },
                product_variant: {
                    id: variant.id,
                    product_id: variant.product_id || '', // null일 경우 빈 문자열로 변환
                    color: variant.color || '', // null일 경우 빈 문자열로 변환
                    color_code: variant.color_code || '', // null일 경우 빈 문자열로 변환
                    inventory: variant.inventory || 0, // null일 경우 0으로 변환
                    is_active: variant.is_active !== false // undefined일 경우 true로 변환
                }
            };

            return cartItem;
        });

        // 유효하지 않은 항목이 있는 경우 자동 제거 처리
        if (cartData && cartData.length > validCartItems.length) {
            const invalidItemIds = cartData
                .filter(item =>
                    !item.product ||
                    !item.product_variant ||
                    item.product.is_active === false ||
                    item.product_variant.is_active === false
                )
                .map(item => item.id);

            if (invalidItemIds.length > 0) {

                // 비동기로 처리하고 결과 기다리지 않음 (성능 최적화)
                supabase
                    .from('carts')
                    .delete()
                    .in('id', invalidItemIds)
                    .then(({ error }) => {
                        if (error) {
                            console.error('무효한 장바구니 항목 삭제 실패:', error);
                        } else {
                            // 캐시 무효화
                            revalidatePath('/cart');
                        }
                    });
            }
        }

        return cartItems;
    } catch (error) {
        console.error('장바구니 조회 중 오류 발생:', error);
        throw new Error('장바구니 목록을 불러오는데 실패했습니다.');
    }
}

// 장바구니 항목 삭제
export async function removeCartItem(itemId: string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('carts')
            .delete()
            .eq('id', itemId)
            .select();

        if (error) {
            console.error('장바구니 삭제 오류:', error);
            return {
                success: false,
                message: `상품 삭제에 실패했습니다: ${error.message}`
            };
        }

        if (!data || data.length === 0) {
            return {
                success: false,
                message: '삭제할 상품을 찾을 수 없습니다.'
            };
        }

        // 캐시 무효화
        revalidatePath('/cart');

        return {
            success: true,
            message: '상품이 장바구니에서 삭제되었습니다.',
            data: data[0]
        };
    } catch (error) {
        console.error('장바구니 삭제 중 오류 발생:', error);
        return {
            success: false,
            message: `상품 삭제 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
        };
    }
}

// 장바구니 항목 수량 변경
export async function updateCartItemQuantity(itemId: string, quantity: number): Promise<{ success: boolean; message: string; data?: any }> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('carts')
            .update({
                quantity: quantity,
                updated_at: new Date().toISOString()
            })
            .eq('id', itemId)
            .select();

        if (error) {
            console.error('수량 변경 오류:', error);
            return {
                success: false,
                message: `수량 변경에 실패했습니다: ${error.message}`
            };
        }

        if (!data || data.length === 0) {
            return {
                success: false,
                message: '수량을 변경할 상품을 찾을 수 없습니다.'
            };
        }

        // 캐시 무효화
        revalidatePath('/cart');

        return {
            success: true,
            message: '상품 수량이 변경되었습니다.',
            data: data[0]
        };
    } catch (error) {
        console.error('수량 변경 중 오류 발생:', error);
        return {
            success: false,
            message: `수량 변경 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
        };
    }
}
export async function getCartItemsCount(userId: string): Promise<number> {
    if (!userId) return 0;

    try {
        const supabase = await createClient();

        const { count, error } = await supabase
            .from('carts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (error) {
            console.error('장바구니 개수 조회 오류:', error);
            return 0;
        }

        return count || 0;
    } catch (error) {
        console.error('장바구니 개수 조회 중 오류 발생:', error);
        return 0;
    }
}