'use server';

import {createClient} from "@/utils/server";
import {FormState} from "@/components/ui/form";
import {ERROR_CODES} from "@/utils/ErrorMessage";
import {ProductsJson} from "@/types";

// 확장된 타입 정의 - 색상별 재고 정보 포함
interface ExtendedProductsJson extends ProductsJson {
    variants?: {
        id: string;
        color: string;
        color_code: string;
        inventory: number;
        is_active: boolean;
    }[];
}

export async function getOneProduct(id: string, search?: string): Promise<FormState & { data?: ExtendedProductsJson }> {
    const supabase = await createClient();

    try {
        let query = supabase
            .from('products')
            .select(`
                *,
                variants:product_variants(
                    id,
                    color,
                    color_code,
                    inventory,
                    is_active
                )
            `);

        // search 파라미터가 있는 경우 이름으로 검색
        if (search) {
            const { data, error } = await query
                .ilike('name', `%${search}%`)
                .limit(1);

            if (error || !data || data.length === 0) {
                return {
                    code: ERROR_CODES.DB_ERROR,
                    message: '검색 결과가 없습니다.',
                    data: undefined
                };
            }

            // 첫 번째 검색 결과 사용
            const productData = data[0];

            // variants 처리
            if (!productData.variants || productData.variants.length === 0) {
                // 기존 로직과 동일하게 variants 생성
                const variants = [];
                if (productData.colors && typeof productData.colors === 'object') {
                    for (const [color, colorCode] of Object.entries(productData.colors)) {
                        const defaultInventory = Math.floor(productData.inventory / Object.keys(productData.colors).length);
                        variants.push({
                            id: '',
                            color: color,
                            color_code: colorCode as string,
                            inventory: defaultInventory,
                            is_active: true
                        });
                    }
                    productData.variants = variants;
                }
            }

            return {
                code: ERROR_CODES.SUCCESS,
                message: '',
                data: productData as ExtendedProductsJson
            };
        }
        // search 파라미터가 없는 경우 ID로 조회 (기존 로직)
        else {
            const { data, error } = await query.eq('id', id).single();

            if (error) {
                console.error("상품 조회 오류:", error);
                return {
                    code: ERROR_CODES.DB_ERROR,
                    message: '상품을 불러오지 못하였습니다.',
                    data: undefined
                };
            }

            // 기존 variants 처리 로직
            if (!data.variants || data.variants.length === 0) {
                const variants = [];
                if (data.colors && typeof data.colors === 'object') {
                    for (const [color, colorCode] of Object.entries(data.colors)) {
                        const defaultInventory = Math.floor(data.inventory / Object.keys(data.colors).length);
                        variants.push({
                            id: '',
                            color: color,
                            color_code: colorCode as string,
                            inventory: defaultInventory,
                            is_active: true
                        });
                    }
                    data.variants = variants;
                }
            }

            return {
                code: ERROR_CODES.SUCCESS,
                message: '',
                data: data as ExtendedProductsJson
            };
        }
    } catch (error) {
        console.error("상품 조회 중 예외 발생:", error);
        return {
            code: ERROR_CODES.SERVER_ERROR,
            message: '서버 에러가 발생하였습니다.',
            data: undefined
        };
    }
}