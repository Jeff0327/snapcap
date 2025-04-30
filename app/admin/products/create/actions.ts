'use server';

import { createClient } from "@/utils/server";
import {FormState} from "@/components/ui/form";
import {ERROR_CODES} from "@/utils/ErrorMessage";


export async function createProduct(formData: FormData): Promise<FormState> {
    const supabase = await createClient();

    try {
        // 기본 상품 정보 추출
        const name = formData.get('name') as string;
        const sku = formData.get('sku') as string || null;
        const price = parseFloat(formData.get('price') as string);
        const salePrice = formData.get('sale_price') ? parseFloat(formData.get('sale_price') as string) : null;
        const inventory = parseInt(formData.get('inventory') as string);
        const isActive = formData.get('is_active') === 'on';
        const description = formData.get('description') as string || '';

        // 이미지 배열 추출
        const images: string[] = [];
        for (let i = 0; i < 10; i++) { // 최대 10개 이미지 지원
            const img = formData.get(`images[${i}]`);
            if (img) images.push(img as string);
        }

        // 태그 배열 추출
        const tags: string[] = [];
        for (let i = 0; i < 20; i++) { // 최대 20개 태그 지원
            const tag = formData.get(`tags[${i}]`);
            if (tag) tags.push(tag as string);
        }

        // 색상 옵션 추출 (JSON으로 저장)
        const colors: { name: string, code: string }[] = [];
        for (let i = 0; i < 20; i++) {
            const colorName = formData.get(`colors[${i}].name`);
            const colorCode = formData.get(`colors[${i}].code`);
            if (colorName && colorCode) {
                colors.push({
                    name: colorName as string,
                    code: colorCode as string
                });
            }
        }

        // 상품 데이터 생성
        const productData = {
            name,
            sku,
            description,
            images,
            price,
            sale_price: salePrice,
            colors: colors.length > 0 ? colors : null,
            inventory,
            is_active: isActive,
            tags: tags.length > 0 ? tags : null
        };

        // Supabase에 상품 추가
        const { data, error } = await supabase
            .from('products')
            .insert(productData)
            .select('id')
            .single();

        if (error) {
            console.error('제품 등록 오류:', error);
            return {
                code: ERROR_CODES.DB_ERROR,
                message: '상품 등록 중 오류가 발생했습니다: ' + error.message
            };
        }

        // 상품 바리에이션 처리 (색상 옵션에 따라)
        if (colors.length > 0) {
            const productId = data.id;
            const variantData = colors.map(color => ({
                product_id: productId,
                color: color.name,
                color_code: color.code,
                inventory: Math.floor(inventory / colors.length), // 재고를 색상 수로 나눔
                is_active: isActive
            }));

            const { error: variantError } = await supabase
                .from('product_variants')
                .insert(variantData);

            if (variantError) {
                console.error('바리에이션 등록 오류:', variantError);
                // 바리에이션 실패해도 상품은 등록되었으므로 성공으로 처리할 수 있음
            }
        }

        return {
            code: ERROR_CODES.SUCCESS,
            message: '상품이 성공적으로 등록되었습니다.'
        };

    } catch (error: any) {
        console.error('상품 등록 서버 오류:', error);
        return {
            code: ERROR_CODES.SERVER_ERROR,
            message: '서버 오류가 발생했습니다: ' + error.message
        };
    }
}