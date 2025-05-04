'use server';

import { ERROR_CODES } from '@/utils/ErrorMessage';
import { revalidatePath } from 'next/cache';
import {createClient} from "@/utils/server";

export async function submitOrder(formData:FormData) {
    try {
        const supabase = await createClient();

        // 필수 입력값 검증
        const name = formData.get('name');
        const phone = formData.get('phone');
        const phoneVerified = formData.get('phoneVerified') === 'true';
        const postalCode = formData.get('postalCode');
        const address1 = formData.get('address1');
        const productId = formData.get('productId');
        const quantity = formData.get('quantity')
        const color = formData.get('color') || null;
        const totalPrice = formData.get('totalPrice')

        if (!name || !phone || !phoneVerified || !postalCode || !address1 || !productId) {
            return {
                code: ERROR_CODES.VALIDATION_ERROR,
                message: '필수 정보가 누락되었습니다. 모든 필수 항목을 입력해주세요.'
            };
        }

        // 주문자와 동일 체크 여부에 따라 수령인 정보 처리
        const sameAsOrderer = formData.get('sameAsOrderer') === 'true';
        const recipientName = sameAsOrderer ? name : formData.get('recipientName');
        const recipientPhone = sameAsOrderer ? phone : formData.get('recipientPhone');

        if (!recipientName || !recipientPhone) {
            return {
                code: ERROR_CODES.VALIDATION_ERROR,
                message: '수령인 정보가 누락되었습니다.'
            };
        }

        // 1. 고객 정보 저장 또는 조회
        let customerId;
        const {data: existingCustomer, error: customerFetchError} = await supabase
            .from('customers')
            .select('id')
            .eq('phone', phone)
            .single();

        if (customerFetchError) {
            // 새 고객 생성
            const {data: newCustomer, error: customerCreateError} = await supabase
                .from('customers')
                .insert({
                    name,
                    phone,
                    email: formData.get('email') || null,
                    is_phone_verified: true
                })
                .select('id')
                .single();

            if (customerCreateError) {
                console.error('고객 정보 생성 오류:', customerCreateError);
                return {
                    code: ERROR_CODES.DB_ERROR,
                    message: '고객 정보 저장 중 오류가 발생했습니다.'
                };
            }

            customerId = newCustomer.id;
        } else {
            customerId = existingCustomer.id;
        }

        // 2. 배송지 정보 저장
        const {data: addressData, error: addressError} = await supabase
            .from('addresses')
            .insert({
                customer_id: customerId,
                recipient_name: recipientName,
                recipient_phone: recipientPhone,
                postal_code: postalCode,
                address1: address1,
                address2: formData.get('address2') || '',
                city: '', // 주소 API에서 분리된 경우 사용
                state: '',
                country: '대한민국',
                is_default: true
            })
            .select('id')
            .single();

        if (addressError) {
            console.error('주소 정보 저장 오류:', addressError);
            return {
                code: ERROR_CODES.DB_ERROR,
                message: '배송지 정보 저장 중 오류가 발생했습니다.'
            };
        }

        // 3. 상품 정보 조회
        const {data: product, error: productError} = await supabase
            .from('products')
            .select(`
        *,
        variants:product_variants(
          id,
          color,
          color_code,
          inventory
        )
      `)
            .eq('id', productId)
            .single();

        if (productError) {
            console.error('상품 정보 조회 오류:', productError);
            return {
                code: ERROR_CODES.DB_ERROR,
                message: '상품 정보를 찾을 수 없습니다.'
            };
        }

        // 주문 금액 계산
        const unitPrice = product.sale_price || product.price;
        const calculatedTotal = unitPrice * parseInt(String(quantity));

        // 4. 주문 생성
        const {data: orderData, error: orderError} = await supabase
            .from('orders')
            .insert({
                customer_id: customerId,
                address_id: addressData.id,
                total_amount: calculatedTotal,
                shipping_fee: 0, // 무료 배송
                discount_amount: 0,
                tax_amount: 0,
                final_amount: calculatedTotal,
                payment_method: formData.get('paymentMethod') || 'card',
                payment_status: 'pending',
                order_status: 'pending',
                notes: formData.get('orderNotes') || null
            })
            .select('id, order_number')
            .single();

        if (orderError) {
            console.error('주문 생성 오류:', orderError);
            return {
                code: ERROR_CODES.DB_ERROR,
                message: '주문 생성 중 오류가 발생했습니다.'
            };
        }

        // 5. 색상 정보에 맞는 재고 확인 및 variant ID 찾기
        let variantId = null;
        let variantColorCode = null;

        if (color && product.variants && product.variants.length > 0) {
            const variant = product.variants.find(v => v.color === color);
            if (variant) {
                variantId = variant.id;
                variantColorCode = variant.color_code;

                // 재고 확인
                if (variant.inventory < parseInt(String(quantity))) {
                    return {
                        code: ERROR_CODES.VALIDATION_ERROR,
                        message: `선택하신 색상의 재고가 부족합니다. 현재 재고: ${variant.inventory}개`
                    };
                }
            }
        }

        // 6. 주문 상품 정보 저장
        const {error: orderItemError} = await supabase
            .from('order_items')
            .insert({
                order_id: orderData.id,
                product_id: productId,
                variant_id: variantId,
                product_name: product.name,
                color: color,
                color_code: variantColorCode || (color && product.colors ? product.colors[color] : null),
                unit_price: unitPrice,
                quantity: quantity,
                subtotal: calculatedTotal
            });

        if (orderItemError) {
            console.error('주문 상품 정보 저장 오류:', orderItemError);
            return {
                code: ERROR_CODES.DB_ERROR,
                message: '주문 상품 정보 저장 중 오류가 발생했습니다.'
            };
        }

        // 7. 재고 업데이트
        if (variantId) {
            // 색상별 재고 업데이트
            const {error: inventoryError} = await supabase
                .from('product_variants')
                .update({inventory: supabase.sql`inventory - ${quantity}`})
                .eq('id', variantId);

            if (inventoryError) {
                console.error('재고 업데이트 오류:', inventoryError);
                // 재고 업데이트 실패해도 주문은 성공으로 처리
            }
        }

        // 전체 제품 재고 업데이트
        const {error: productInventoryError} = await supabase
            .from('products')
            .update({inventory: supabase.sql`inventory - ${quantity}`})
            .eq('id', productId);

        if (productInventoryError) {
            console.error('제품 재고 업데이트 오류:', productInventoryError);
            // 실패해도 주문 처리는 성공으로 간주
        }

        // 경로 재검증
        revalidatePath(`/products/${productId}`);

        // 성공 응답 반환 (주문번호 포함)
        return {
            code: ERROR_CODES.SUCCESS,
            message: '주문이 성공적으로 처리되었습니다.',
            data: {
                order_number: orderData.order_number
            }
        };

    } catch (error) {
        return {
            code: ERROR_CODES.SERVER_ERROR,
            message: '서버 오류가 발생했습니다.'
        }
    }
}

