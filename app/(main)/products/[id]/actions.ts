'use server';

import {createClient} from "@/utils/server";
import {FormState} from "@/components/ui/form";
import {ERROR_CODES} from "@/utils/ErrorMessage";
import {Carts, ProductsJson} from "@/types";
import {revalidatePath} from "next/cache";

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

//카트 추가
interface AddToCartProps {
    productId: string;
    quantity: number;
    variantId: string
    colorName: string
    colorCode: string
    userId: string;
}

export async function addToCart({
                                    productId,
                                    quantity,
                                    variantId,
                                    colorName,
                                    colorCode,
                                    userId
                                }: AddToCartProps): Promise<FormState> {
    const supabase = await createClient();

    if (!userId) {
        return {
            code: ERROR_CODES.AUTH_ERROR,
            message: '로그인이 필요한 서비스입니다.'
        };
    }

    if (!productId || !quantity || quantity < 1) {
        return {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: '상품 정보나 수량이 올바르지 않습니다.'
        };
    }

    try {
        // 상품 정보와 variants 함께 조회
        const { data: product, error: productError } = await supabase
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
            .eq('id', productId)
            .single();

        if (productError || !product) {
            return {
                code: ERROR_CODES.DB_ERROR,
                message: '상품 정보를 찾을 수 없습니다.'
            };
        }

        // variants가 있는지 확인
        const hasVariants = product.variants &&
            Array.isArray(product.variants) &&
            product.variants.length > 0;

        // variant 선택 검증
        if (hasVariants && !variantId && !colorName) {
            return {
                code: ERROR_CODES.VALIDATION_ERROR,
                message: '색상을 선택해주세요.'
            };
        }

        // variant ID로 재고 확인
        let inventoryToCheck = product.inventory;
        let selectedVariantId = variantId;

        if (hasVariants) {
            // variantId가 없고 colorName이 있는 경우 해당 colorName으로 variant 찾기
            if (!variantId && colorName) {
                const variant = product.variants.find(v => v.color === colorName);
                if (variant) {
                    selectedVariantId = variant.id;
                    inventoryToCheck = variant.inventory as number;
                }
            } else if (variantId) {
                const variant = product.variants.find(v => v.id === variantId);
                if (variant) {
                    inventoryToCheck = variant.inventory as number;
                }
            }
        }

        // 재고 확인
        if (inventoryToCheck < quantity) {
            return {
                code: ERROR_CODES.VALIDATION_ERROR,
                message: '요청하신 수량이 재고보다 많습니다.'
            };
        }

        // cart 테이블에 상품 추가 또는 업데이트
        const { error } = await supabase
            .from('carts')
            .upsert(
                {
                    user_id: userId,
                    product_id: productId,
                    variant_id: selectedVariantId,
                    quantity: quantity,
                    color: colorName,
                    color_code: colorCode,
                    updated_at: new Date().toISOString()
                },
                {
                    onConflict: 'user_id, product_id'
                }
            );

        if (error) {
            console.error('장바구니 추가 오류:', error);
            return {
                code: ERROR_CODES.DB_ERROR,
                message: '장바구니에 상품을 추가하는 데 실패했습니다.'
            };
        }

        // 성공 시 캐시 무효화
        revalidatePath('/cart');

        return {
            code: ERROR_CODES.SUCCESS,
            message: '장바구니에 상품이 추가되었습니다.'
        };
    } catch (error) {
        console.error('장바구니 추가 중 예외 발생:', error);
        return {
            code: ERROR_CODES.SERVER_ERROR,
            message: '서버 오류가 발생했습니다.'
        };
    }
}