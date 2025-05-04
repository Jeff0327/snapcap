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

export async function getOneProduct(id: string): Promise<FormState & { data?: ExtendedProductsJson }> {
    const supabase = await createClient();

    try {
        // 상품 기본 정보와 변형(variants) 정보를 함께 조회
        const { data, error } = await supabase
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
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error("상품 조회 오류:", error);
            return {
                code: ERROR_CODES.DB_ERROR,
                message: '상품을 불러오지 못하였습니다.',
                data: undefined
            };
        }

        // 색상별 재고 정보가 없는 경우, colors 필드에서 기본 색상 정보를 가져와서 variants 생성
        if (!data.variants || data.variants.length === 0) {
            const variants = [];

            // colors 필드가 존재하고 객체인 경우 (JSONB)
            if (data.colors && typeof data.colors === 'object') {
                // 각 색상을 variants로 변환
                for (const [color, colorCode] of Object.entries(data.colors)) {
                    // 기본 재고는 전체 재고를 색상 수로 나눈 값으로 설정 (나중에 수정 가능)
                    const defaultInventory = Math.floor(data.inventory / Object.keys(data.colors).length);

                    variants.push({
                        id: '', // 신규 생성할 예정이므로 빈 ID
                        color: color,
                        color_code: colorCode as string,
                        inventory: defaultInventory,
                        is_active: true
                    });
                }

                // 변환된 variants 정보 추가
                data.variants = variants;
            }
        }

        return {
            code: ERROR_CODES.SUCCESS,
            message: '',
            data: data as ExtendedProductsJson
        };
    } catch (error) {
        console.error("상품 조회 중 예외 발생:", error);
        return {
            code: ERROR_CODES.SERVER_ERROR,
            message: '서버 에러가 발생하였습니다.',
            data: undefined
        };
    }
}