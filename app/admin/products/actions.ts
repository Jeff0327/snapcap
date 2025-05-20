'use server';

import { createClient } from "@/utils/server";
import { AdminClient } from "@/utils/adminClient"; // 관리자 권한 클라이언트 추가
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

// 상품 삭제 전 안전성 확인
async function checkProductDependencies(productId: string) {
    const supabase = await createClient();

    // product_variants 테이블에서 해당 상품의 바리에이션 ID 목록 가져오기
    const { data: variants, error: variantsError } = await supabase
        .from('product_variants')
        .select('id')
        .eq('product_id', productId);

    if (variantsError) {
        throw new Error(`바리에이션 목록 조회 중 오류: ${variantsError.message}`);
    }

    if (!variants || variants.length === 0) {
        return { canDelete: true, orderCount: 0 };
    }

    // 바리에이션 ID 목록 추출
    const variantIds = variants.map(v => v.id);

    // order_products 테이블에서 해당 바리에이션이 사용된 주문 수 확인
    const { count, error: orderError } = await supabase
        .from('order_products')
        .select('*', { count: 'exact', head: true })
        .in('variant_id', variantIds);

    if (orderError) {
        throw new Error(`주문 확인 중 오류: ${orderError.message}`);
    }

    return {
        canDelete: count === 0, // 주문이 없으면 삭제 가능
        orderCount: count || 0
    };
}

// 소프트 삭제 (바리에이션과 상품을 비활성화만 함)
async function softDeleteProduct(productId: string) {
    const supabase = await createClient();

    // 1. 상품의 모든 바리에이션 비활성화
    const { error: variantError } = await supabase
        .from('product_variants')
        .update({ is_active: false })
        .eq('product_id', productId);

    if (variantError) {
        throw new Error(`바리에이션 비활성화 중 오류: ${variantError.message}`);
    }

    // 2. 상품 비활성화
    const { error: productError } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', productId);

    if (productError) {
        throw new Error(`상품 비활성화 중 오류: ${productError.message}`);
    }

    return true;
}

// 상품 삭제 (주문이 없는 경우만 실제 삭제, 있으면 비활성화)
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

        // 삭제 가능 여부 확인
        const { canDelete, orderCount } = await checkProductDependencies(productId);

        // 주문이 있는 경우 소프트 삭제(비활성화)만 수행
        if (!canDelete) {
            await softDeleteProduct(productId);

            return {
                code: ERROR_CODES.SUCCESS,
                message: `이 상품으로 ${orderCount}개의 주문이 존재하여 삭제할 수 없습니다. 대신 상품이 비활성화되었습니다.`
            };
        }

        // 주문이 없는 경우 실제 삭제 진행
        // 1. 바리에이션 삭제
        const { error: variantError } = await supabase
            .from('product_variants')
            .delete()
            .eq('product_id', productId);

        if (variantError) {
            return {
                code: ERROR_CODES.DB_ERROR,
                message: '상품 바리에이션 삭제 중 오류가 발생했습니다: ' + variantError.message
            };
        }

        // 2. 상품 삭제
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

// 관리자 전용: 상품 관련 주문 데이터 강제 삭제 (매우 위험, 백업 필수)
export async function forceDeleteProduct(formData: FormData) {
    const supabase = AdminClient(); // 관리자 권한으로 접근

    try {
        const productId = formData.get('productId') as string;
        const confirmCode = formData.get('confirmCode') as string;

        if (!productId) {
            return {
                code: ERROR_CODES.VALIDATION_ERROR,
                message: '상품 ID가 필요합니다.'
            };
        }

        if (confirmCode !== 'DELETE_CONFIRM') {
            return {
                code: ERROR_CODES.VALIDATION_ERROR,
                message: '삭제 확인 코드가 올바르지 않습니다.'
            };
        }

        // 바리에이션 ID 목록 가져오기
        const { data: variants, error: variantsError } = await supabase
            .from('product_variants')
            .select('id')
            .eq('product_id', productId);

        if (variantsError) {
            return {
                code: ERROR_CODES.DB_ERROR,
                message: '바리에이션 목록 조회 중 오류가 발생했습니다: ' + variantsError.message
            };
        }

        const variantIds = variants?.map(v => v.id) || [];

        // 트랜잭션으로 처리하는 것이 좋지만, 현재 Supabase JS 클라이언트에서는 트랜잭션 지원이 제한적입니다.
        // 따라서 순차적으로 처리합니다.

        // 1. 주문 상품에서 해당 바리에이션 관련 데이터 삭제
        if (variantIds.length > 0) {
            const { error: orderProductsError } = await supabase
                .from('order_products')
                .delete()
                .in('variant_id', variantIds);

            if (orderProductsError) {
                return {
                    code: ERROR_CODES.DB_ERROR,
                    message: '주문 상품 삭제 중 오류가 발생했습니다: ' + orderProductsError.message
                };
            }
        }

        // 2. 바리에이션 삭제
        const { error: variantError } = await supabase
            .from('product_variants')
            .delete()
            .eq('product_id', productId);

        if (variantError) {
            return {
                code: ERROR_CODES.DB_ERROR,
                message: '상품 바리에이션 삭제 중 오류가 발생했습니다: ' + variantError.message
            };
        }

        // 3. 상품 삭제
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
            message: '상품 및 관련 주문 데이터가 성공적으로 삭제되었습니다. (주의: 이 작업은 되돌릴 수 없습니다)'
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