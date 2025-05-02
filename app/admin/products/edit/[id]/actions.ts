'use server';

import { createClient } from "@/utils/server";
import { FormState } from "@/components/ui/form";
import { ERROR_CODES } from "@/utils/ErrorMessage";

export async function editProduct(productId: string, formData: FormData): Promise<FormState> {
    const supabase = await createClient();

    try {
        const name = formData.get('name') as string;
        const sku = formData.get('sku') as string || null;
        const price = parseFloat(formData.get('price') as string);
        const salePrice = formData.get('sale_price') ? parseFloat(formData.get('sale_price') as string) : null;
        const inventory = parseInt(formData.get('inventory') as string);
        const isActive = formData.get('is_active') === 'on';
        const description = formData.get('description') as string || '';

        const images: string[] = [];
        for (let i = 0; i < 10; i++) {
            const img = formData.get(`images[${i}]`);
            if (img) images.push(img as string);
        }

        const tags: string[] = [];
        for (let i = 0; i < 20; i++) {
            const tag = formData.get(`tags[${i}]`);
            if (tag) tags.push(tag as string);
        }

        const colors: { name: string, code: string }[] = [];
        for (let i = 0; i < 20; i++) {
            const colorName = formData.get(`colors[${i}].name`);
            const colorCode = formData.get(`colors[${i}].code`);
            if (colorName && colorCode) {
                colors.push({ name: colorName as string, code: colorCode as string });
            }
        }

        const updatedData = {
            name,
            sku,
            price,
            sale_price: salePrice,
            inventory,
            is_active: isActive,
            description,
            images,
            colors: colors.length > 0 ? colors : null,
            tags: tags.length > 0 ? tags : null
        };

        const { error } = await supabase
            .from('products')
            .update(updatedData)
            .eq('id', productId);

        if (error) {
            console.error('상품 수정 오류:', error);
            return {
                code: ERROR_CODES.DB_ERROR,
                message: '상품 수정 중 오류가 발생했습니다: ' + error.message
            };
        }

        // 바리에이션 업데이트: 기존 삭제 후 재삽입
        if (colors.length > 0) {
            await supabase
                .from('product_variants')
                .delete()
                .eq('product_id', productId);

            const variantData = colors.map(color => ({
                product_id: productId,
                color: color.name,
                color_code: color.code,
                inventory: Math.floor(inventory / colors.length),
                is_active: isActive
            }));

            const { error: variantError } = await supabase
                .from('product_variants')
                .insert(variantData);

            if (variantError) {
                console.error('바리에이션 재등록 오류:', variantError);
                // 무시 가능
            }
        }

        return {
            code: ERROR_CODES.SUCCESS,
            message: '상품이 성공적으로 수정되었습니다.'
        };

    } catch (error: any) {
        console.error('상품 수정 서버 오류:', error);
        return {
            code: ERROR_CODES.SERVER_ERROR,
            message: '서버 오류가 발생했습니다: ' + error.message
        };
    }
}
