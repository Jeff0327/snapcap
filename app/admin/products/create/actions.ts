'use server';

import { createClient } from "@/utils/server";
import { FormState } from "@/components/ui/form";
import { ERROR_CODES } from "@/utils/ErrorMessage";

export async function createProduct(formData: FormData): Promise<FormState> {
    const supabase = await createClient();

    try {
        // 기본 상품 정보 추출
        const name = formData.get('name') as string;
        const sku = formData.get('sku') as string || null;
        const price = parseFloat(formData.get('price') as string);
        const salePrice = formData.get('sale_price') ? parseFloat(formData.get('sale_price') as string) : null;
        const isActive = formData.get('is_active') === 'on';
        const description = formData.get('description') as string || '';
        const type =formData.get('type') as string;
        // 이미지 배열 추출
        const images: string[] = [];
        for (const [key, value] of formData.entries()) {
            if (key.startsWith('images[') && value) {
                images.push(value as string);
            }
        }

        // 태그 배열 추출
        const tags: string[] = [];
        for (const [key, value] of formData.entries()) {
            if (key.startsWith('tags[') && value) {
                tags.push(value as string);
            }
        }

        // 변형(variants) 정보 추출 및 처리
        const variants: { color: string; colorCode: string; inventory: number }[] = [];
        const variantIndices = new Set<number>();

        // 먼저 가능한 모든 변형 인덱스 수집
        for (const [key, _] of formData.entries()) {
            if (key.startsWith('variants[')) {
                const match = key.match(/variants\[(\d+)\]/);
                if (match && match[1]) {
                    variantIndices.add(parseInt(match[1]));
                }
            }
        }

        // 각 변형 데이터 처리
        variantIndices.forEach(index => {
            const color = formData.get(`variants[${index}][color]`) as string;
            const colorCode = formData.get(`variants[${index}][colorCode]`) as string;
            const inventory = parseInt(formData.get(`variants[${index}][inventory]`) as string || '0');

            if (color) {
                variants.push({
                    color,
                    colorCode,
                    inventory
                });
            }
        });

        // 색상 정보를 colors JSONB 필드에 맞게 변환
        const colorsObj: Record<string, string> = {};
        variants.forEach(v => {
            if (v.color && v.colorCode) {
                colorsObj[v.color] = v.colorCode;
            }
        });

        // 총 재고 계산
        const totalInventory = variants.reduce((sum, v) => sum + (v.inventory || 0), 0);

        // 상품 데이터 생성
        const productData = {
            name,
            sku,
            description,
            images,
            price,
            sale_price: salePrice,
            colors: Object.keys(colorsObj).length > 0 ? colorsObj : null,
            inventory: totalInventory, // 모든 색상의 재고 합계
            is_active: isActive,
            tags: tags.length > 0 ? tags : null,
            type
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

        // 각 색상별 재고 정보 저장
        if (variants.length > 0) {
            const productId = data.id;
            const variantData = variants.map(variant => ({
                product_id: productId,
                color: variant.color,
                color_code: variant.colorCode,
                inventory: variant.inventory, // 각 색상별 재고 저장
                is_active: isActive
            }));

            const { error: variantError } = await supabase
                .from('product_variants')
                .insert(variantData);

            if (variantError) {
                console.error('바리에이션 등록 오류:', variantError);
                return {
                    code: ERROR_CODES.DB_ERROR,
                    message: '색상별 재고 정보 저장 중 오류가 발생했습니다: ' + variantError.message
                };
            }
        }

        return {
            code: ERROR_CODES.SUCCESS,
            message: '상품이 성공적으로 등록되었습니다.'
        };

    } catch (error) {
        return {
            code: ERROR_CODES.SERVER_ERROR,
            message: '서버 오류가 발생했습니다: '
        };
    }
}