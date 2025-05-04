'use server';

import { createClient } from '@/utils/supabase/server';
import { ERROR_CODES } from '@/utils/ErrorMessage';
import { revalidatePath } from 'next/cache';

// 부트페이 결제 검증용 API 클라이언트
class BootpayClient {
    private applicationId: string;
    private privateKey: string;
    private token: string | null = null;
    private expiredAt: number = 0;

    constructor(applicationId: string, privateKey: string) {
        this.applicationId = applicationId;
        this.privateKey = privateKey;
    }

    // 토큰 발급 (인증)
    async getToken() {
        const now = Date.now();
        if (this.token && this.expiredAt > now) {
            return this.token;
        }

        try {
            const response = await fetch('https://api.bootpay.co.kr/request/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    application_id: this.applicationId,
                    private_key: this.privateKey,
                }),
            });

            const data = await response.json();
            if (!data.token) {
                throw new Error('토큰 발급 실패');
            }

            this.token = data.token;
            this.expiredAt = now + (data.expired_at || 3600) * 1000;
            return this.token;
        } catch (error) {
            console.error('부트페이 토큰 발급 오류:', error);
            throw error;
        }
    }

    // 결제 검증
    async verifyPayment(receiptId: string) {
        try {
            const token = await this.getToken();
            const response = await fetch(`https://api.bootpay.co.kr/receipt/${receiptId}`, {
                method: 'GET',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json',
                },
            });

            return await response.json();
        } catch (error) {
            console.error('부트페이 결제 검증 오류:', error);
            throw error;
        }
    }

    // 결제 취소
    async cancelPayment(receiptId: string, reason: string) {
        try {
            const token = await this.getToken();
            const response = await fetch('https://api.bootpay.co.kr/cancel', {
                method: 'POST',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    receipt_id: receiptId,
                    reason: reason,
                }),
            });

            return await response.json();
        } catch (error) {
            console.error('부트페이 결제 취소 오류:', error);
            throw error;
        }
    }
}

// 부트페이 클라이언트 인스턴스 생성
const bootpayClient = new BootpayClient(
    process.env.BOOTPAY_APPLICATION_ID || 'YOUR_BOOTPAY_APPLICATION_ID',
    process.env.BOOTPAY_PRIVATE_KEY || 'YOUR_BOOTPAY_PRIVATE_KEY'
);

// 주문 처리 서버 액션
export async function submitOrder(formData: FormData) {
    try {
        const supabase = createClient();

        // 필수 입력값 검증
        const name = formData.get('name') as string;
        const phone = formData.get('phone') as string;
        const phoneVerified = formData.get('phoneVerified') === 'true';
        const postalCode = formData.get('postalCode') as string;
        const address1 = formData.get('address1') as string;
        const address2 = formData.get('address2') as string || '';
        const productId = formData.get('productId') as string;
        const quantity = parseInt(formData.get('quantity') as string || '1');
        const color = formData.get('color') as string || null;
        const totalPrice = parseFloat(formData.get('totalPrice') as string || '0');
        const receiptId = formData.get('receiptId') as string; // 부트페이에서 반환된 영수증 ID
        const orderId = formData.get('orderId') as string; // 부트페이에 전달한 주문 ID

        if (!name || !phone || !phoneVerified || !postalCode || !address1 || !productId || !receiptId || !orderId) {
            return {
                code: ERROR_CODES.INVALID_INPUT,
                message: '필수 정보가 누락되었습니다. 모든 필수 항목을 입력해주세요.'
            };
        }

        // 주문자와 동일 체크 여부에 따라 수령인 정보 처리
        const sameAsOrderer = formData.get('sameAsOrderer') === 'true';
        const recipientName = sameAsOrderer ? name : formData.get('recipientName') as string;
        const recipientPhone = sameAsOrderer ? phone : formData.get('recipientPhone') as string;

        if (!recipientName || !recipientPhone) {
            return {
                code: ERROR_CODES.INVALID_INPUT,
                message: '수령인 정보가 누락되었습니다.'
            };
        }

        // 1. 부트페이 결제 검증
        try {
            const verifyResult = await bootpayClient.verifyPayment(receiptId);

            // 결제 검증 실패
            if (verifyResult.status !== 1) {
                // 결제 취소 시도
                await bootpayClient.cancelPayment(receiptId, '결제 검증 실패');
                return {
                    code: ERROR_CODES.PAYMENT_ERROR,
                    message: '결제 검증에 실패했습니다. 다시 시도해주세요.'
                };
            }

            // 결제 금액 검증
            if (verifyResult.price !== totalPrice) {
                // 결제 취소 시도
                await bootpayClient.cancelPayment(receiptId, '결제 금액 불일치');
                return {
                    code: ERROR_CODES.PAYMENT_ERROR,
                    message: '결제 금액이 일치하지 않습니다.'
                };
            }

        } catch (error) {
            console.error('결제 검증 오류:', error);
            return {
                code: ERROR_CODES.PAYMENT_ERROR,
                message: '결제 검증 중 오류가 발생했습니다.'
            };
        }

        // 2. 고객 정보 저장 또는 조회
        let customerId;
        const { data: existingCustomer, error: customerFetchError } = await supabase
            .from('customers')
            .select('id')
            .eq('phone', phone)
            .single();

        if (customerFetchError) {
            // 새 고객 생성
            const { data: newCustomer, error: customerCreateError } = await supabase
                .from('customers')
                .insert({
                    name,
                    phone,
                    email: formData.get('email') as string || null,
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

        // 3. 배송지 정보 저장
        const { data: addressData, error: addressError } = await supabase
            .from('addresses')
            .insert({
                customer_id: customerId,
                recipient_name: recipientName,
                recipient_phone: recipientPhone,
                postal_code: postalCode,
                address1: address1,
                address2: address2,
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

        // 4. 상품 정보 조회
        const { data: product, error: productError } = await supabase
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

        // 5. 주문 생성
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert({
                customer_id: customerId,
                address_id: addressData.id,
                order_number: orderId, // 부트페이에 전달한 주문 ID
                receipt_id: receiptId, // 부트페이 영수증 ID
                total_amount: totalPrice,
                shipping_fee: 0, // 무료 배송
                discount_amount: 0,
                tax_amount: 0,
                final_amount: totalPrice,
                payment_method: formData.get('paymentMethod') as string || 'card',
                payment_status: 'paid', // 부트페이 검증이 완료되었으므로 결제 완료 상태
                order_status: 'processing', // 주문 처리 중 상태
                notes: formData.get('orderNotes') as string || null
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

        // 6. 색상 정보에 맞는 재고 확인 및 variant ID 찾기
        let variantId = null;
        let variantColorCode = null;

        if (color && product.variants && product.variants.length > 0) {
            const variant = product.variants.find(v => v.color === color);
            if (variant) {
                variantId = variant.id;
                variantColorCode = variant.color_code;

                // 재고 확인
                if (variant.inventory < quantity) {
                    return {
                        code: ERROR_CODES.INVENTORY_ERROR,
                        message: `선택하신 색상의 재고가 부족합니다. 현재 재고: ${variant.inventory}개`
                    };
                }
            }
        }

        // 7. 주문 상품 정보 저장
        const { error: orderItemError } = await supabase
            .from('order_items')
            .insert({
                order_id: orderData.id,
                product_id: productId,
                variant_id: variantId,
                product_name: product.name,
                color: color,
                color_code: variantColorCode || (color && product.colors ? product.colors[color] : null),
                unit_price: product.sale_price || product.price,
                quantity: quantity,
                subtotal: totalPrice
            });

        if (orderItemError) {
            console.error('주문 상품 정보 저장 오류:', orderItemError);
            return {
                code: ERROR_CODES.DB_ERROR,
                message: '주문 상품 정보 저장 중 오류가 발생했습니다.'
            };
        }

        // 8. 재고 업데이트
        if (variantId) {
            // 색상별 재고 업데이트
            const { error: inventoryError } = await supabase
                .from('product_variants')
                .update({ inventory: supabase.sql`inventory - ${quantity}` })
                .eq('id', variantId);

            if (inventoryError) {
                console.error('재고 업데이트 오류:', inventoryError);
                // 재고 업데이트 실패해도 주문은 성공으로 처리
            }
        }

        // 전체 제품 재고 업데이트
        const { error: productInventoryError } = await supabase
            .from('products')
            .update({ inventory: supabase.sql`inventory - ${quantity}` })
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
        console.error('주문 처리 오류:', error);
        return {
            code: ERROR_CODES.SERVER_ERROR,
            message: '서버 오류가 발생했습니다. 다시 시도해주세요.'
        };
    }
}