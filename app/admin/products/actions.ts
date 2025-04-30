'use server';

import { createClient } from "@/utils/server";
import { ERROR_CODES } from "@/utils/ErrorMessage";
import { States } from "@/types";
import { revalidatePath } from "next/cache";

// 상품 목록 가져오기
export async function getProductList(): Promise<States> {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('상품 목록 조회 오류:', error);
            return { success: false, data: null, error: error.message };
        }

        return { success: true, data, error: null };
    } catch (error: any) {
        console.error('상품 목록 조회 중 예외 발생:', error);
        return { success: false, data: null, error: error.message };
    }
}

// 상품 삭제
export async function deleteProduct(formData: FormData) {
    const supabase = await createClient();

    try {
        const productId = formData.get('productId') as string;

        if (!productId) {
            return {
                code: ERROR_CODES.VALIDATION_ERROR,
                message: '상품 ID가 필요합니다.'
            };
        }

        // 상품 바리에이션 먼저 삭제 (CASCADE 설정이 있어도 명시적으로 처리)
        const { error: variantError } = await supabase
            .from('product_variants')
            .delete()
            .eq('product_id', productId);

        if (variantError) {
            console.error('상품 바리에이션 삭제 오류:', variantError);
        }

        // 상품 삭제
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId);

        if (error) {
            return {
                code: ERROR_CODES.DB_ERROR,
                message: '상품 삭제 중 오류가 발생했습니다: ' + error.message
            };
        }

        // 캐시 갱신
        revalidatePath('/admin/products');

        return {
            code: ERROR_CODES.SUCCESS,
            message: '상품이 성공적으로 삭제되었습니다.'
        };
    } catch (error: any) {
        return {
            code: ERROR_CODES.SERVER_ERROR,
            message: '서버 오류가 발생했습니다: ' + error.message
        };
    }
}

// 상품 상태 변경 (활성화/비활성화)
export async function toggleProductStatus(formData: FormData) {
    const supabase = await createClient();

    try {
        const productId = formData.get('productId') as string;
        const isActive = formData.get('isActive') === 'true';

        if (!productId) {
            return {
                code: ERROR_CODES.VALIDATION_ERROR,
                message: '상품 ID가 필요합니다.'
            };
        }

        const { error } = await supabase
            .from('products')
            .update({ is_active: !isActive })
            .eq('id', productId);

        if (error) {
            return {
                code: ERROR_CODES.DB_ERROR,
                message: '상품 상태 변경 중 오류가 발생했습니다: ' + error.message
            };
        }

        // 캐시 갱신
        revalidatePath('/admin/products');

        return {
            code: ERROR_CODES.SUCCESS,
            message: `상품이 ${!isActive ? '활성화' : '비활성화'}되었습니다.`
        };
    } catch (error: any) {
        return {
            code: ERROR_CODES.SERVER_ERROR,
            message: '서버 오류가 발생했습니다: ' + error.message
        };
    }
}