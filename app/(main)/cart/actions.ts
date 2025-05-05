// app/(main)/cart/actions.ts
'use server';

import { createClient } from "@/utils/server";
import { CartItem } from "@/types";
import {revalidatePath} from "next/cache";

export async function getCartItems(userId: string): Promise<CartItem[]> {
    try {
        const supabase = await createClient();

        // 장바구니 항목 조회
        const { data: cartData, error: cartError } = await supabase
            .from('carts')
            .select('*')
            .eq('user_id', userId);

        if (cartError) {
            console.error('장바구니 조회 오류:', cartError);
            throw new Error('장바구니 목록을 불러오는데 실패했습니다.');
        }

        // 각 장바구니 항목의 상품 정보 조회
        const cartItems: CartItem[] = [];

        for (const cartItem of cartData || []) {
            const { data: productData, error: productError } = await supabase
                .from('products')
                .select('id, name, price, sale_price, images, inventory')
                .eq('id', cartItem.product_id)
                .single();

            if (!productError && productData) {
                cartItems.push({
                    ...cartItem,
                    product: productData
                } as CartItem);
            } else {
                // 상품 정보가 없어도 장바구니 항목은 유지
                cartItems.push({
                    ...cartItem,
                    product: undefined
                } as CartItem);
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