'use server';

import { createClient } from "@/utils/server";
import {revalidatePath} from "next/cache";
import {FormState} from "@/components/ui/form";
import {ERROR_CODES} from "@/utils/ErrorMessage";

// 재고 확인 함수
// 🎯 수정된 재고 확인 함수 - variant별 재고 확인
async function checkInventoryAvailability(orderId: string) {
    try {
        const supabase = await createClient();

        console.log('📦 Variant 재고 확인 시작:', orderId);

        // 주문 상품 정보와 variant 정보 조회
        const { data: orderProducts, error: productsError } = await supabase
            .from('order_products')
            .select(`
                *,
                product:products(id, name),
                variant:product_variants(id, color, inventory, is_active)
            `)
            .eq('order_id', orderId);

        if (productsError || !orderProducts) {
            console.error('주문 상품 조회 실패:', productsError);
            throw new Error('주문 상품 정보를 조회할 수 없습니다.');
        }

        console.log('📋 재고 확인 상품 목록:', orderProducts);

        const inventoryChecks = [];
        let hasOutOfStock = false;
        let totalShortage = 0;

        for (const orderProduct of orderProducts) {
            const product = orderProduct.product;
            const variant = orderProduct.variant;
            const orderQuantity = orderProduct.quantity || 0;

            let currentInventory = 0;
            let isInStock = false;
            let productName = product?.name || '상품명 없음';
            let variantInfo = '';

            if (variant) {
                // 🎯 Variant가 있는 경우 - variant 재고 확인 (타입 안전하게)
                currentInventory = variant.inventory || 0;
                const isVariantActive = variant.is_active === true; // 🎯 null 체크
                isInStock = isVariantActive && currentInventory >= orderQuantity;
                variantInfo = ` - ${variant.color || '색상명 없음'}`;
            } else {
                // 🎯 Variant가 없는 경우 - 기본 상품 재고 확인
                // 별도로 products 테이블에서 재고 조회
                const { data: productData } = await supabase
                    .from('products')
                    .select('inventory')
                    .eq('id', orderProduct.product_id)
                    .single();

                currentInventory = productData?.inventory || 0;
                isInStock = currentInventory >= orderQuantity;
            }

            if (!isInStock) {
                hasOutOfStock = true;
                totalShortage += (orderQuantity - currentInventory);
            }

            const checkResult = {
                product_id: orderProduct.product_id,
                variant_id: orderProduct.variant_id,
                product_name: productName + variantInfo,
                order_quantity: orderQuantity,
                current_inventory: currentInventory,
                is_in_stock: isInStock,
                shortage: isInStock ? 0 : (orderQuantity - currentInventory),
                variant_color: variant?.color || null
            };

            inventoryChecks.push(checkResult);

            console.log(`📦 ${checkResult.product_name}:`);
            console.log(`  - 주문 수량: ${orderQuantity}`);
            console.log(`  - 현재 재고: ${currentInventory}`);
            console.log(`  - 재고 상태: ${isInStock ? '✅ 충분' : '❌ 부족'}`);
            if (!isInStock) {
                console.log(`  - 부족 수량: ${checkResult.shortage}`);
            }
        }

        return {
            success: true,
            has_out_of_stock: hasOutOfStock,
            total_shortage: totalShortage,
            checks: inventoryChecks,
            can_proceed: !hasOutOfStock
        };

    } catch (error: any) {
        console.error('❌ 재고 확인 중 오류:', error);
        return {
            success: false,
            error: error.message,
            has_out_of_stock: true,
            can_proceed: false,
            checks: []
        };
    }
}

// 수정된 getOrdersProduct 함수 - 재고 확인 포함
export async function getOrdersProduct(id: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                message: '로그인이 필요합니다.'
            };
        }

        // 주문 기본 정보 조회
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();

        if (orderError || !order) {
            console.error('주문 조회 실패:', orderError);
            return {
                success: false,
                message: '주문 정보를 찾을 수 없습니다.'
            };
        }

        // 주소 정보 별도 조회
        const { data: addressData, error: addressError } = await supabase
            .from('addresses')
            .select('recipient_name, phone_number, address_line1, address_line2')
            .eq('id', order.address_id)
            .single();

        if (addressError) {
            console.error('주소 조회 실패:', addressError);
        }

        // 주문 상품 정보 조회 (재고 정보 포함)
        const { data: orderProducts, error: productsError } = await supabase
            .from('order_products')
            .select(`
                *,
                product:products(*),
                variant:product_variants(*)
            `)
            .eq('order_id', id);

        if (productsError) {
            console.error('주문 상품 조회 실패:', productsError);
            return {
                success: false,
                message: '주문 상품 정보를 조회하는데 실패했습니다.'
            };
        }

        // 🎯 재고 확인 (결제 대기 상태일 때만)
        let inventoryCheck = null;
        if (order.payment_status === 'pending') {
            inventoryCheck = await checkInventoryAvailability(id);
        }

        return {
            success: true,
            data: {
                ...order,
                address: addressData || null,
                products: orderProducts || [],
                inventory_check: inventoryCheck // 🎯 재고 확인 결과 추가
            }
        };
    } catch (error) {
        console.error('주문 조회 중 오류 발생:', error);
        return {
            success: false,
            message: '주문 정보를 조회하는데 실패했습니다.'
        };
    }
}

// 🎯 결제 전 재고 재확인 함수
export async function validateInventoryBeforePayment(orderId: string): Promise<FormState> {
    try {
        const inventoryCheck = await checkInventoryAvailability(orderId);

        if (!inventoryCheck.success) {
            return {
                code: ERROR_CODES.SERVER_ERROR,
                message: '재고 확인 중 오류가 발생했습니다.'
            };
        }

        if (inventoryCheck.has_out_of_stock) {
            const outOfStockProducts = inventoryCheck.checks
                .filter(check => !check.is_in_stock)
                .map(check => `${check.product_name} (${check.shortage}개 부족)`)
                .join(', ');

            return {
                code: ERROR_CODES.VALIDATION_ERROR,
                message: `품절된 상품이 있어 결제할 수 없습니다: ${outOfStockProducts}`
            };
        }

        return {
            code: ERROR_CODES.SUCCESS,
            message: '재고 확인 완료',
            data: inventoryCheck
        };

    } catch (error: any) {
        console.error('결제 전 재고 확인 실패:', error);
        return {
            code: ERROR_CODES.SERVER_ERROR,
            message: '재고 확인 중 오류가 발생했습니다.'
        };
    }
}

// 🎯 수정된 SMS 발송 함수 (order_id를 8자리로 변환)
async function sendPaymentNotificationSMS(orderData: {
    primary_product_name: string;
    items_count: number;
    payment_method: string;
    total_amount: number;
    payment_status: string;
    order_number?: string;
    order_id: string;
    // 🎯 새로 추가된 필드들
    recipient_name: string;        // 받는사람 이름
    phone_number: string;          // 받는사람 전화번호
    address_line1: string;         // 주소
    address_line2?: string;        // 상세주소
    total_quantity: number;        // 총 수량
}) {
    try {
        const apiSecret = process.env.API_SECRET!;
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!;

        // order_id의 마지막 8자리를 order_number로 사용
        const shortOrderNumber = orderData.order_id.slice(-8);

        const smsData = {
            ...orderData,
            order_number: shortOrderNumber // 8자리 order_number로 교체
        };

        console.log('📱 SMS 발송 데이터 (주소포함):', smsData);

        const response = await fetch(`${baseUrl}/api/twilio`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiSecret
            },
            body: JSON.stringify(smsData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${response.status} - ${errorData.error}`);
        }

        const result = await response.json();
        console.log('✅ 결제 알림 SMS 발송 성공:', result);
        return { success: true, data: result };

    } catch (error: any) {
        console.error('❌ SMS 알림 발송 중 오류:', error);
        return { success: false, error: error.message };
    }
}
// 재고 차감 함수 추가
async function deductInventory(orderId: string) {
    try {
        const supabase = await createClient();

        console.log('📦 Variant 재고 차감 시작:', orderId);

        // 주문 상품 정보 조회 (variant_id 포함)
        const { data: orderProducts, error: productsError } = await supabase
            .from('order_products')
            .select('product_id, variant_id, quantity')
            .eq('order_id', orderId);

        if (productsError || !orderProducts) {
            console.error('주문 상품 조회 실패:', productsError);
            throw new Error('주문 상품 정보를 조회할 수 없습니다.');
        }

        console.log('📋 차감할 상품 목록:', orderProducts);

        const inventoryUpdates = [];

        for (const orderProduct of orderProducts) {
            const orderQuantity = orderProduct.quantity || 0;

            if (orderProduct.variant_id) {
                // 🎯 Variant가 있는 경우 - variant 재고 차감
                const { data: variant, error: variantError } = await supabase
                    .from('product_variants')
                    .select('id, color, inventory, product_id, products(name)')
                    .eq('id', orderProduct.variant_id)
                    .single();

                if (variantError || !variant) {
                    console.error(`Variant 조회 실패 (${orderProduct.variant_id}):`, variantError);
                    continue;
                }

                const currentInventory = variant.inventory || 0;
                const newInventory = currentInventory - orderQuantity;
                const productName = (variant.products as any)?.name || '상품명 없음';

                console.log(`📦 ${productName} - ${variant.color || '색상'}:`);
                console.log(`  - 현재 재고: ${currentInventory}`);
                console.log(`  - 주문 수량: ${orderQuantity}`);
                console.log(`  - 차감 후: ${newInventory}`);

                if (newInventory < 0) {
                    console.warn(`⚠️  재고 부족: ${productName} - ${variant.color} (재고: ${currentInventory}, 주문: ${orderQuantity})`);
                }

                // Variant 재고 업데이트
                const { error: updateError } = await supabase
                    .from('product_variants')
                    .update({
                        inventory: newInventory,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', orderProduct.variant_id);

                if (updateError) {
                    console.error(`Variant 재고 업데이트 실패 (${variant.color}):`, updateError);
                    inventoryUpdates.push({
                        type: 'variant',
                        variant_id: orderProduct.variant_id,
                        product_name: productName,
                        variant_color: variant.color,
                        success: false,
                        error: updateError.message
                    });
                } else {
                    console.log(`✅ Variant 재고 차감 완료: ${productName} - ${variant.color} (${currentInventory} → ${newInventory})`);
                    inventoryUpdates.push({
                        type: 'variant',
                        variant_id: orderProduct.variant_id,
                        product_name: productName,
                        variant_color: variant.color,
                        success: true,
                        old_inventory: currentInventory,
                        new_inventory: newInventory,
                        deducted_quantity: orderQuantity
                    });
                }
            } else {
                // 🎯 Variant가 없는 경우 - 기본 상품 재고 차감 (기존 로직)
                const { data: product, error: productError } = await supabase
                    .from('products')
                    .select('id, name, inventory')
                    .eq('id', orderProduct.product_id)
                    .single();

                if (productError || !product) {
                    console.error(`상품 조회 실패 (${orderProduct.product_id}):`, productError);
                    continue;
                }

                const currentInventory = product.inventory || 0;
                const newInventory = currentInventory - orderQuantity;

                console.log(`📦 ${product.name} (기본):`);
                console.log(`  - 현재 재고: ${currentInventory}`);
                console.log(`  - 주문 수량: ${orderQuantity}`);
                console.log(`  - 차감 후: ${newInventory}`);

                if (newInventory < 0) {
                    console.warn(`⚠️  재고 부족: ${product.name} (재고: ${currentInventory}, 주문: ${orderQuantity})`);
                }

                // 기본 상품 재고 업데이트
                const { error: updateError } = await supabase
                    .from('products')
                    .update({
                        inventory: newInventory,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', orderProduct.product_id);

                if (updateError) {
                    console.error(`상품 재고 업데이트 실패 (${product.name}):`, updateError);
                    inventoryUpdates.push({
                        type: 'product',
                        product_id: orderProduct.product_id,
                        product_name: product.name,
                        success: false,
                        error: updateError.message
                    });
                } else {
                    console.log(`✅ 상품 재고 차감 완료: ${product.name} (${currentInventory} → ${newInventory})`);
                    inventoryUpdates.push({
                        type: 'product',
                        product_id: orderProduct.product_id,
                        product_name: product.name,
                        success: true,
                        old_inventory: currentInventory,
                        new_inventory: newInventory,
                        deducted_quantity: orderQuantity
                    });
                }
            }
        }

        return {
            success: true,
            updates: inventoryUpdates,
            total_products: orderProducts.length
        };

    } catch (error: any) {
        console.error('❌ 재고 차감 중 오류:', error);
        return {
            success: false,
            error: error.message,
            updates: []
        };
    }
}

// 수정된 updateOrderPayment 함수
export async function updateOrderPayment(orderId: string, paymentInfo: {
    paymentMethod?: string;
    receiptId?: string;
    paymentData?: any;
}) {
    try {
        const supabase = await createClient();

        console.log('🔄 주문 결제 정보 업데이트 시작:', orderId);
        console.log('💳 결제 정보:', paymentInfo);

        // 결제 정보와 주문 상태 업데이트
        const { data, error } = await supabase
            .from('orders')
            .update({
                payment_status: 'paid',
                payment_method: paymentInfo.paymentMethod || '카드',
                order_status: 'processing',
                updated_at: new Date().toISOString(),
            })
            .eq('id', orderId)
            .select()
            .single();

        if (error) {
            console.error('❌ 주문 상태 업데이트 실패:', error);
            return {
                success: false,
                message: '결제 정보 업데이트에 실패했습니다: ' + error.message
            };
        }

        console.log('✅ 주문 결제 정보 업데이트 완료:', data);

        // 🎯 재고 차감 처리
        const inventoryResult = await deductInventory(orderId);

        if (inventoryResult.success) {
            console.log('✅ 재고 차감 완료:', inventoryResult);
        } else {
            console.error('❌ 재고 차감 실패:', inventoryResult.error);
            // 재고 차감 실패해도 결제는 완료로 처리 (별도 관리 필요)
        }

        // 주소 정보 조회
        const { data: addressData, error: addressError } = await supabase
            .from('addresses')
            .select('recipient_name, phone_number, address_line1, address_line2')
            .eq('id', data.address_id)
            .single();

        if (addressError) {
            console.error('❌ 주소 조회 실패:', addressError);
        }

        // 주문 상품들의 총 수량 계산
        const { data: orderProducts, error: productsError } = await supabase
            .from('order_products')
            .select('quantity')
            .eq('order_id', orderId);

        const totalQuantity = orderProducts?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

        console.log('📍 배송 주소:', addressData);
        console.log('📦 총 수량:', totalQuantity);

        // SMS 발송 (재고 차감 정보 포함)
        sendPaymentNotificationSMS({
            primary_product_name: data.primary_product_name || '',
            items_count: data.items_count,
            payment_method: data.payment_method,
            total_amount: data.total_amount,
            payment_status: data.payment_status,
            order_number: data.order_number || '',
            order_id: orderId,
            recipient_name: addressData?.recipient_name || '정보없음',
            phone_number: addressData?.phone_number || '정보없음',
            address_line1: addressData?.address_line1 || '주소정보없음',
            address_line2: addressData?.address_line2 || '',
            total_quantity: totalQuantity
        }).then(result => {
            if (result.success) {
                console.log('✅ 결제 알림 SMS API 호출 성공:', result.data?.messageSid);
            } else {
                console.error('❌ 결제 알림 SMS API 호출 실패:', result.error);
            }
        }).catch(error => {
            console.error('❌ SMS API 호출 중 예외 발생:', error);
        });

        // 캐시 무효화
        revalidatePath(`/order/payment/${orderId}`);
        revalidatePath('/orders');
        revalidatePath('/admin/products'); // 재고 변경으로 상품 관리 페이지도 갱신

        return {
            success: true,
            message: '결제가 완료되었습니다.',
            data: {
                ...data,
                inventory_deduction: inventoryResult
            }
        };
    } catch (error: any) {
        console.error('❌ 결제 정보 업데이트 중 오류 발생:', error);
        return {
            success: false,
            message: '결제 정보 업데이트 중 오류가 발생했습니다: ' + (error.message || JSON.stringify(error))
        };
    }
}

// 🎯 추가: 재고 복구 함수 (주문 취소/환불 시 사용)
async function restoreInventory(orderId: string) {
    try {
        const supabase = await createClient();

        console.log('🔄 Variant 재고 복구 시작:', orderId);

        // 주문 상품 정보 조회 (variant_id 포함)
        const { data: orderProducts, error: productsError } = await supabase
            .from('order_products')
            .select('product_id, variant_id, quantity')
            .eq('order_id', orderId);

        if (productsError || !orderProducts) {
            console.error('주문 상품 조회 실패:', productsError);
            throw new Error('주문 상품 정보를 조회할 수 없습니다.');
        }

        console.log('📋 복구할 상품 목록:', orderProducts);

        const inventoryRestores = [];

        for (const orderProduct of orderProducts) {
            if (orderProduct.variant_id) {
                // 🎯 Variant 재고 복구
                const { data: variant, error: variantError } = await supabase
                    .from('product_variants')
                    .select('id, color, inventory, products(name)')
                    .eq('id', orderProduct.variant_id)
                    .single();

                if (variantError || !variant) {
                    console.error(`Variant 조회 실패 (${orderProduct.variant_id}):`, variantError);
                    continue;
                }

                const currentInventory = variant.inventory;
                const restoreQuantity = orderProduct.quantity;
                const newInventory = currentInventory + restoreQuantity;

                console.log(`📦 ${variant.products?.name} - ${variant.color}:`);
                console.log(`  - 현재 재고: ${currentInventory}`);
                console.log(`  - 복구 수량: ${restoreQuantity}`);
                console.log(`  - 복구 후: ${newInventory}`);

                // Variant 재고 업데이트
                const { error: updateError } = await supabase
                    .from('product_variants')
                    .update({
                        inventory: newInventory,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', orderProduct.variant_id);

                if (updateError) {
                    console.error(`Variant 재고 복구 실패 (${variant.color}):`, updateError);
                    inventoryRestores.push({
                        type: 'variant',
                        variant_id: orderProduct.variant_id,
                        product_name: variant.products?.name,
                        variant_color: variant.color,
                        success: false,
                        error: updateError.message
                    });
                } else {
                    console.log(`✅ Variant 재고 복구 완료: ${variant.products?.name} - ${variant.color} (${currentInventory} → ${newInventory})`);
                    inventoryRestores.push({
                        type: 'variant',
                        variant_id: orderProduct.variant_id,
                        product_name: variant.products?.name,
                        variant_color: variant.color,
                        success: true,
                        old_inventory: currentInventory,
                        new_inventory: newInventory,
                        restored_quantity: restoreQuantity
                    });
                }
            } else {
                // 🎯 기본 상품 재고 복구 (기존 로직)
                const { data: product, error: productError } = await supabase
                    .from('products')
                    .select('id, name, inventory')
                    .eq('id', orderProduct.product_id)
                    .single();

                if (productError || !product) {
                    console.error(`상품 조회 실패 (${orderProduct.product_id}):`, productError);
                    continue;
                }

                const currentInventory = product.inventory;
                const restoreQuantity = orderProduct.quantity;
                const newInventory = currentInventory + restoreQuantity;

                console.log(`📦 ${product.name} (기본):`);
                console.log(`  - 현재 재고: ${currentInventory}`);
                console.log(`  - 복구 수량: ${restoreQuantity}`);
                console.log(`  - 복구 후: ${newInventory}`);

                // 기본 상품 재고 업데이트
                const { error: updateError } = await supabase
                    .from('products')
                    .update({
                        inventory: newInventory,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', orderProduct.product_id);

                if (updateError) {
                    console.error(`상품 재고 복구 실패 (${product.name}):`, updateError);
                    inventoryRestores.push({
                        type: 'product',
                        product_id: orderProduct.product_id,
                        product_name: product.name,
                        success: false,
                        error: updateError.message
                    });
                } else {
                    console.log(`✅ 상품 재고 복구 완료: ${product.name} (${currentInventory} → ${newInventory})`);
                    inventoryRestores.push({
                        type: 'product',
                        product_id: orderProduct.product_id,
                        product_name: product.name,
                        success: true,
                        old_inventory: currentInventory,
                        new_inventory: newInventory,
                        restored_quantity: restoreQuantity
                    });
                }
            }
        }

        return {
            success: true,
            restores: inventoryRestores,
            total_products: orderProducts.length
        };

    } catch (error: any) {
        console.error('❌ 재고 복구 중 오류:', error);
        return {
            success: false,
            error: error.message,
            restores: []
        };
    }
}

// 🎯 추가: 주문 취소 함수
export async function cancelOrder(orderId: string): Promise<FormState> {
    try {
        const supabase = await createClient();

        // 주문 상태를 취소로 변경
        const { data, error } = await supabase
            .from('orders')
            .update({
                order_status: 'cancelled',
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId)
            .select()
            .single();

        if (error) {
            return {
                code: ERROR_CODES.DB_ERROR,
                message: '주문 취소에 실패했습니다: ' + error.message
            };
        }

        // 결제 완료된 주문이면 재고 복구
        if (data.payment_status === 'paid') {
            const restoreResult = await restoreInventory(orderId);
            console.log('재고 복구 결과:', restoreResult);
        }

        revalidatePath('/orders');
        revalidatePath('/admin/products');

        return {
            code: ERROR_CODES.SUCCESS,
            message: '주문이 취소되었습니다.',
            data: data
        };

    } catch (error: any) {
        console.error('주문 취소 중 오류:', error);
        return {
            code: ERROR_CODES.SERVER_ERROR,
            message: '주문 취소 중 오류가 발생했습니다.'
        };
    }
}

// 테스트용 함수
export async function testSendSMS(): Promise<FormState> {
    try {
        const apiSecret = process.env.API_SECRET!;
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!;

        const response = await fetch(`${baseUrl}/api/twilio`, {
            method: 'GET',
            headers: {
                'x-api-key': apiSecret
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            return {
                code: ERROR_CODES.SERVER_ERROR,
                message: `SMS 테스트 실패: ${errorData.error}`
            };
        }

        const result = await response.json();

        return {
            code: ERROR_CODES.SUCCESS,
            message: 'SMS 테스트 발송 성공!',
            data: result.messageSid
        };
    } catch (error: any) {
        console.error('SMS 테스트 발송 중 오류:', error);
        return {
            code: ERROR_CODES.SERVER_ERROR,
            message: `SMS 테스트 발송 중 오류: ${error.message}`
        };
    }
}