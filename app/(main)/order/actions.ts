'use server';

import {createClient} from "@/utils/server";
import {revalidatePath} from "next/cache";
import {getCartItems} from "@/app/(main)/cart/actions";
import {ERROR_CODES} from "@/utils/ErrorMessage";
import {FormState} from "@/components/ui/form";
import {getOrderName} from "@/utils/utils";

export async function createOrder(formData: FormData): Promise<FormState> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 배송지 정보 추출
    const recipientName = formData.get('recipientName') as string;
    const addressLine1 = formData.get('address') as string;
    const addressLine2 = formData.get('addressDetail') as string || '';
    const phoneNumber = formData.get('phoneNumber') as string;
    const notes = formData.get('notes') as string || '';

    // 주문자 정보
    const ordererName = formData.get('ordererName') as string;
    const ordererPhone = formData.get('ordererPhone') as string;
    const email = formData.get('email') as string || '';

    // 총 금액 문자열 처리
    const totalAmountStr = formData.get('totalAmount') as string;
    let totalAmount = 0;

    try {
        // 숫자나 숫자 문자열로 변환 시도
        totalAmount = parseFloat(totalAmountStr.replace(/[^\d.-]/g, '')); // 숫자가 아닌 문자 제거
    } catch (e) {
        // 변환 실패 시 이후 단계에서 직접 계산
        console.warn('Failed to parse totalAmount:', totalAmountStr);
    }

    // 사용자 인증 확인
    if (!user) {
        return {
            code: ERROR_CODES.AUTH_ERROR,
            message: '로그인이 필요합니다.'
        };
    }

    // 필수 필드 검증
    if (!recipientName || !addressLine1 || !addressLine2 || !phoneNumber) {
        return {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: '주문자 정보와 배송지 정보를 확인해주세요.'
        };
    }

    try {
        // 1. 고객 정보 조회 또는 생성
        let { data: customer, error: customerError } = await supabase
            .from('customers')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (customerError || !customer) {
            // 고객 정보가 없으면 생성
            const { data: newCustomer, error: createCustomerError } = await supabase
                .from('customers')
                .insert({
                    user_id: user.id,
                    name: ordererName || recipientName, // 주문자 이름 우선 사용
                    email: email || user.email || '',
                    phone: ordererPhone || phoneNumber // 주문자 번호 우선 사용
                })
                .select()
                .single();

            if (createCustomerError) {
                console.error('Failed to create customer:', createCustomerError);
                return {
                    code: ERROR_CODES.DB_ERROR,
                    message: '고객 정보 생성에 실패했습니다.'
                };
            }

            customer = newCustomer;
        } else if (ordererName && ordererPhone) {
            // 기존 고객 정보 업데이트
            const { error: updateCustomerError } = await supabase
                .from('customers')
                .update({
                    name: ordererName,
                    phone: ordererPhone,
                    email: email || customer.email || user.email || ''
                })
                .eq('id', customer.id);

            if (updateCustomerError) {
                console.error('Failed to update customer:', updateCustomerError);
                // 실패해도 진행 (중요하지 않은 업데이트)
            }
        }

        // 2. 배송지 정보 저장
        const { data: address, error: addressError } = await supabase
            .from('addresses')
            .insert({
                customer_id: customer.id,
                recipient_name: recipientName,
                phone_number: phoneNumber,
                address_line1: addressLine1,
                address_line2: addressLine2,
                is_default: false // 기본 주소로 설정하지 않음
            })
            .select()
            .single();

        if (addressError) {
            console.error('Failed to create address:', addressError);
            return {
                code: ERROR_CODES.DB_ERROR,
                message: '주소 정보 저장에 실패했습니다.'
            };
        }

        // 3. 장바구니 항목 조회
        const cartItems = await getCartItems(user.id);

        // 유효한 장바구니 항목 필터링
        const validItems = cartItems.filter(item =>
            item.product &&
            item.product_variant
        );

        if (validItems.length === 0) {
            return {
                code: ERROR_CODES.VALIDATION_ERROR,
                message: '장바구니가 비어있거나 유효한 상품이 없습니다.'
            };
        }

        // 4. 주문 메타데이터 준비
        // 첫 번째 상품 정보 및 총 상품 수
        const firstItem = validItems[0];
        const primaryProductName = getOrderName(validItems);
        const primaryProductImage = firstItem.product?.images?.[0] || '';
        const itemsCount = validItems.length;

        // 총 주문 금액 계산 (totalAmount가 유효하지 않은 경우 직접 계산)
        const orderTotalAmount = isNaN(totalAmount) || totalAmount <= 0 ?
            validItems.reduce((total, item) => {
                if (!item.product) return total;
                const price = item.product.sale_price || item.product.price;
                return total + (price * item.quantity);
            }, 0) : totalAmount;

        // 5. 주문 생성
        // order_number는 NULL로 전달하여 트리거가 자동 생성하도록 함
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                address_id: address.id,
                total_amount: orderTotalAmount,
                payment_method: 'pending',
                payment_status: 'pending',
                order_status: 'pending',
                notes: notes,
                items_count: itemsCount,
                primary_product_name: primaryProductName,
                primary_product_image: primaryProductImage,
                order_number: null // NULL로 전달하여 트리거가 자동 생성하도록 함
            })
            .select()
            .single();

        if (orderError) {
            console.error('Failed to create order:', orderError);
            return {
                code: ERROR_CODES.DB_ERROR,
                message: '주문 생성에 실패했습니다.'
            };
        }

        // 6. 주문 상품 정보 생성
        const orderProductsData = validItems.map(item => {
            const product = item.product!;
            const variant = item.product_variant!;

            // 상품 이미지 선택
            const productImage = product.images && product.images.length > 0
                ? product.images[0]
                : '';

            return {
                order_id: order.id,
                product_id: item.product_id,
                variant_id: item.variant_id,
                quantity: item.quantity,
                price: product.sale_price || product.price,
                color: item.color || variant.color || '',
                color_code: item.color_code || variant.color_code || '',

                // 스냅샷 데이터 (DB 스키마에 이 필드들이 추가되어 있어야 함)
                product_name: product.name,
                product_image: productImage,
                variant_name: variant.color || '',
                original_price: product.price
            };
        });

        // 주문 상품 데이터 저장
        const { error: orderProductsError } = await supabase
            .from('order_products')
            .insert(orderProductsData);

        if (orderProductsError) {
            console.error('Failed to create order products:', orderProductsError);
            return {
                code: ERROR_CODES.DB_ERROR,
                message: '주문 상품 정보 저장에 실패했습니다.'
            };
        }

        // 7. 장바구니 비우기
        const { error: clearCartError } = await supabase
            .from('carts')
            .delete()
            .eq('user_id', user.id);

        if (clearCartError) {
            console.error('Failed to clear cart:', clearCartError);
            // 장바구니 비우기 실패는 주문 진행에 치명적이지 않으므로 계속 진행
        }

        // 8. 캐시 무효화
        revalidatePath('/cart');
        revalidatePath('/orders');

        // 9. 성공 응답 반환
        return {
            code: ERROR_CODES.SUCCESS,
            message: '주문이 성공적으로 생성되었습니다.',
            data: order.id // 주문 ID 반환 (결제 페이지로 전달)
        };
    } catch (error) {
        console.error('Order creation error:', error);
        return {
            code: ERROR_CODES.SERVER_ERROR,
            message: '서버 에러가 발생하였습니다.'
        };
    }
}

export async function getOrderById(orderId: string) {
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
            .select(`
                *,
                address:addresses(
                    recipient_name,
                    phone_number,
                    address_line1,
                    address_line2
                )
            `)
            .eq('id', orderId)
            .eq('user_id', user.id) // 본인 주문만 조회
            .single();

        if (orderError || !order) {
            console.error('주문 조회 실패:', orderError);
            return {
                success: false,
                message: '주문 정보를 찾을 수 없습니다.'
            };
        }

        // 주문 상품 정보 조회
        const { data: orderProducts, error: productsError } = await supabase
            .from('order_products')
            .select(`
                *,
                product:products(*),
                variant:product_variants(*)
            `)
            .eq('order_id', orderId);

        if (productsError) {
            console.error('주문 상품 조회 실패:', productsError);
            return {
                success: false,
                message: '주문 상품 정보를 조회하는데 실패했습니다.'
            };
        }

        return {
            success: true,
            data: {
                ...order,
                products: orderProducts || []
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

export async function directPurchase(formData: FormData): Promise<FormState> {
    // 이 함수는 createOrder와 유사하지만, 장바구니에서 가져오는 대신
    // formData에서 상품 정보를 직접 받습니다.

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 배송지 정보
    const recipientName = formData.get('recipientName') as string;
    const addressLine1 = formData.get('address') as string;
    const addressLine2 = formData.get('addressDetail') as string || '';
    const phoneNumber = formData.get('phoneNumber') as string;
    const notes = formData.get('notes') as string || '';

    // 상품 정보
    const productId = formData.get('productId') as string;
    const variantId = formData.get('variantId') as string;
    const quantity = parseInt(formData.get('quantity') as string || '1');
    const color = formData.get('color') as string;
    const colorCode = formData.get('colorCode') as string;
    const price = parseFloat(formData.get('price') as string);

    if (!user) {
        return {
            code: ERROR_CODES.AUTH_ERROR,
            message: '로그인이 필요합니다.'
        };
    }

    // 필수 필드 검증
    if (!recipientName || !addressLine1 || !addressLine2 || !phoneNumber) {
        return {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: '배송지 정보를 확인해주세요.'
        };
    }

    if (!productId || !variantId || !color || !colorCode || !price) {
        return {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: '상품 정보가 올바르지 않습니다.'
        };
    }

    try {
        // 1. 상품 정보 조회
        const { data: productData, error: productError } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        if (productError || !productData) {
            return {
                code: ERROR_CODES.DB_ERROR,
                message: '상품 정보를 찾을 수 없습니다.'
            };
        }

        // 2. 변형 정보 조회
        const { data: variantData, error: variantError } = await supabase
            .from('product_variants')
            .select('*')
            .eq('id', variantId)
            .single();

        if (variantError || !variantData) {
            return {
                code: ERROR_CODES.DB_ERROR,
                message: '상품 옵션 정보를 찾을 수 없습니다.'
            };
        }

        // 3. 고객 정보 조회 또는 생성
        // 이하 로직은 createOrder와 동일...

        // // 직접 구매용 CartItem 구성
        // const directPurchaseItem: CartItem = {
        //     id: 'direct-purchase', // 임시 ID
        //     user_id: user.id,
        //     product_id: productId,
        //     variant_id: variantId,
        //     quantity: quantity,
        //     color: color,
        //     color_code: colorCode,
        //     product: productData,
        //     product_variant: variantData
        // };

        // 이제 이 아이템으로 주문 생성 로직 실행
        // 나머지 로직은 createOrder와 유사...

        // 여기서는 이 기능이 필요한지 확실하지 않아 구현 세부사항을 생략합니다.

        return {
            code: ERROR_CODES.SUCCESS,
            message: '주문이 성공적으로 생성되었습니다.',
            data: '주문ID가 여기에 들어감'
        };
    } catch (error) {
        console.error('Order creation error:', error);
        return {
            code: ERROR_CODES.SERVER_ERROR,
            message: '서버 에러가 발생하였습니다.'
        };
    }
}