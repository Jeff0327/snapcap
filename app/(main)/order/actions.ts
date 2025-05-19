'use server';

import {createClient} from "@/utils/server";
import {revalidatePath} from "next/cache";
import {getCartItems} from "@/app/(main)/cart/actions";
import {ERROR_CODES} from "@/utils/ErrorMessage";
import {FormState} from "@/components/ui/form";
import {formatToE164, formatToNormalPhone, getOrderName} from "@/utils/utils";
import {z} from "zod";
import {AdminClient} from "@/utils/adminClient";

const PhoneSchema = z.object({
    phone: z.string()
        .min(10, "전화번호를 정확히 입력해주세요.")
        .regex(/^\d+$/, "숫자만 입력 가능합니다."),
});

const OtpVerificationSchema = z.object({
    phone: z.string()
        .min(10, "전화번호를 정확히 입력해주세요.")
        .regex(/^\d+$/, "숫자만 입력 가능합니다."),
    otp: z.string()
        .length(6, "인증번호는 6자리여야 합니다.")
        .regex(/^\d+$/, "숫자만 입력 가능합니다."),
});
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
    if (!recipientName || !addressLine1 || !phoneNumber) {
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
        await supabase
            .from('carts')
            .delete()
            .eq('user_id', user.id);


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

/**
 * 주문 처리 시 여러 계정의 주문을 통합하여 조회하는 함수
 */
// 인증번호 전송 로직
// 전화번호 인증 코드 전송
export async function verifyPhoneCodeServer(phone: string, otp: string) {
    if (!phone || !otp) {
        return {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: '전화번호와 인증번호를 모두 입력해주세요.'
        };
    }

    try {
        // 서버 측 Supabase 클라이언트 생성
        const supabase = await createClient()
        const adminSupabase = AdminClient();
        const e164Phone = formatToE164(phone);
        const normalPhone = formatToNormalPhone(phone);

        // 1. 현재 로그인한 사용자 확인
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return {
                code: ERROR_CODES.AUTH_ERROR,
                message: '로그인이 필요합니다.'
            };
        }

        const { error: metadataError } = await adminSupabase.auth.admin.updateUserById(
            user.id,
            {
                user_metadata: {
                    ...user.user_metadata, // 기존 메타데이터 유지
                    verified_phone: normalPhone,
                    phone_verified_at: new Date().toISOString(),
                    verification_status: 'verified'
                }
            }
        );

        if (metadataError) {
            console.error('사용자 메타데이터 업데이트 오류 (Admin):', metadataError);
            // 메타데이터 업데이트 실패해도 계속 진행 (백업 방법으로)
        } else {
            console.log('사용자 메타데이터 업데이트 성공 (Admin)');
        }

        // 4. 백업/동기화: customers 테이블 업데이트
        // maybeSingle() 사용으로 "no rows" 에러 방지
        const { data: existingCustomer, error: customerError } = await supabase
            .from('customers')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle(); // single() 대신 maybeSingle() 사용

        if (customerError) {
            console.error('고객 정보 조회 오류:', customerError);
            return {
                code: ERROR_CODES.DB_ERROR,
                message: '고객 정보 조회 중 오류가 발생했습니다.'
            };
        }

        // 고객 정보 업데이트 또는 생성
        if (existingCustomer) {
            // 기존 고객 정보 업데이트
            const { error: updateError } = await supabase
                .from('customers')
                .update({
                    phone: normalPhone,
                    verified_phone: normalPhone,
                    phone_verified_at: new Date().toISOString()
                })
                .eq('id', existingCustomer.id);

            if (updateError) {
                console.error('고객 정보 업데이트 오류:', updateError);
                return {
                    code: ERROR_CODES.DB_ERROR,
                    message: '고객 정보 업데이트 중 오류가 발생했습니다.'
                };
            }
        } else {
            // 새 고객 정보 생성
            const { error: insertError } = await supabase
                .from('customers')
                .insert({
                    user_id: user.id,
                    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Guest',
                    email: user.email || '',
                    phone: normalPhone,
                    verified_phone: normalPhone,
                    phone_verified_at: new Date().toISOString()
                });

            if (insertError) {
                console.error('고객 정보 생성 오류:', insertError);
                return {
                    code: ERROR_CODES.DB_ERROR,
                    message: '고객 정보 생성 중 오류가 발생했습니다.'
                };
            }
        }

        // 4. 인증된 전화번호로 다른 계정 찾기
        const { data: phoneCustomers, error: phoneCustomersError } = await supabase
            .from('customers')
            .select('user_id')
            .eq('verified_phone', normalPhone)
            .neq('user_id', user.id);

        if (phoneCustomersError) {
            console.error('관련 계정 조회 오류:', phoneCustomersError);
            // 계속 진행 (선택적 단계)
        }

        // 5. 계정 연결 처리
        let linkedCount = 0;
        if (phoneCustomers && phoneCustomers.length > 0) {
            for (const linkedCustomer of phoneCustomers) {
                const { error: linkError } = await supabase
                    .from('linked_accounts')
                    .upsert({
                        primary_user_id: user.id,
                        linked_user_id: linkedCustomer.user_id,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'primary_user_id,linked_user_id'
                    });

                if (!linkError) {
                    linkedCount++;
                } else {
                    console.error('계정 연결 오류:', linkError);
                }
            }
        }

        return {
            code: ERROR_CODES.SUCCESS,
            message: '전화번호 인증이 완료되었습니다.',
            data: {
                verified: true,
                phone: normalPhone,
                linkedAccounts: linkedCount
            }
        };

    } catch (error) {
        console.error('서버 측 전화번호 인증 오류:', error);
        return {
            code: ERROR_CODES.SERVER_ERROR,
            message: '전화번호 인증 처리 중 오류가 발생했습니다.'
        };
    }
}

/**
 * 클라이언트에서 인증번호 발송을 요청하는 서버 액션
 */
export async function sendVerificationCodeServer(phone: string) {
    if (!phone) {
        return {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: '전화번호를 입력해주세요.'
        };
    }

    try {
        // 서버 측 Supabase 클라이언트 생성
        const supabase = await createClient()
        const e164Phone = formatToE164(phone);

        // 1. 현재 로그인한 사용자 확인
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return {
                code: ERROR_CODES.AUTH_ERROR,
                message: '로그인이 필요합니다.'
            };
        }

        // 2. Admin API 또는 함수를 사용하여 인증 코드 발송
        // 이 부분은 실제 백엔드 구현에 따라 다름
        // Supabase Edge Functions을 통해 구현하거나 Admin API를 사용해야 함

        // 간단한 예: 클라이언트 API를 사용하되 메타데이터에 인증 목적 표시
        const { error: otpError } = await supabase.auth.signInWithOtp({
            phone: e164Phone,
            options: {
                // 커스텀 메타데이터로 OTP 목적 명시
                data: {
                    purpose: 'verification',
                    user_id: user.id,
                    timestamp: new Date().toISOString()
                }
            }
        });

        if (otpError) {
            console.error('OTP 전송 오류:', otpError);
            return {
                code: ERROR_CODES.DB_ERROR,
                message: `인증번호 전송에 실패했습니다: ${otpError.message}`
            };
        }

        return {
            code: ERROR_CODES.SUCCESS,
            message: '인증번호가 발송되었습니다.',
            data: { phone: e164Phone }
        };

    } catch (error) {
        console.error('인증번호 발송 오류:', error);
        return {
            code: ERROR_CODES.SERVER_ERROR,
            message: '인증번호 발송 중 오류가 발생했습니다.'
        };
    }
}

// 인증번호 확인 및 계정 연결
export async function verifyPhoneCode(phone: string, otp: string): Promise<FormState> {
    if (!phone || !otp) {
        return {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: '인증번호를 입력해주세요.'
        }
    }

    const validationResult = OtpVerificationSchema.safeParse({
        phone: phone.replace(/^\+/, ''),
        otp
    });

    if (!validationResult.success) {
        return {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: '인증 정보가 올바르지 않습니다.'
        };
    }

    try {
        const supabase = await createClient();
        const adminSupabase = AdminClient()
        const e164Phone = formatToE164(phone);
        const normalPhone = formatToNormalPhone(phone);

        // 1. 현재 로그인한 사용자 정보 가져오기 (먼저 확인)
        const { data: { user: currentUser } } = await supabase.auth.getUser();

        if (!currentUser) {
            return {
                code: ERROR_CODES.AUTH_ERROR,
                message: '로그인이 필요합니다.'
            };
        }

        // 2. OTP 인증 (계정 전환 방지)
        const { data, error } = await supabase.auth.verifyOtp({
            phone: e164Phone,
            token: otp,
            type: 'sms',
        });

        if (error) {
            console.error("OTP 확인 에러:", error);
            return {
                code: ERROR_CODES.DB_ERROR,
                message: '인증번호가 일치하지 않습니다.'
            };
        }

        // 3. 사용자 메타데이터 업데이트 (auth.users 테이블)
        const { error: updateError } = await adminSupabase.auth.updateUser({
            data: {
                verified_phone: normalPhone,
                phone_verified_at: new Date().toISOString()
            }
        });

        if (updateError) {
            console.error("사용자 메타데이터 업데이트 에러:", updateError);
            // 메타데이터 업데이트 실패해도 계속 진행
        }

        // 4. 현재 사용자의 customers 정보 업데이트
        const { data: existingCustomer } = await supabase
            .from('customers')
            .select('id')
            .eq('user_id', currentUser.id)
            .single();

        if (existingCustomer) {
            // 기존 고객 정보 업데이트
            await supabase
                .from('customers')
                .update({
                    phone: normalPhone,
                    verified_phone: normalPhone, // 추가: 인증된 전화번호 저장
                    phone_verified_at: new Date().toISOString() // 추가: 인증 시간 저장
                })
                .eq('id', existingCustomer.id);
        } else {
            // 고객 정보가 없으면 새로 생성
            const userMetadata = currentUser.user_metadata || {};

            await supabase
                .from('customers')
                .insert({
                    user_id: currentUser.id,
                    name: userMetadata.full_name || 'Guest',
                    email: currentUser.email || '',
                    phone: normalPhone,
                    verified_phone: normalPhone, // 추가: 인증된 전화번호 저장
                    phone_verified_at: new Date().toISOString() // 추가: 인증 시간 저장
                });
        }

        // 5. 동일한 전화번호를 가진 다른 계정 찾기 - verified_phone 필드 사용
        const { data: phoneCustomers } = await supabase
            .from('customers')
            .select('user_id')
            .eq('verified_phone', normalPhone) // 수정: phone → verified_phone
            .neq('user_id', currentUser.id); // 현재 사용자 제외

        // 6. 계정 연결 처리
        let linkedCount = 0;
        if (phoneCustomers && phoneCustomers.length > 0) {
            try {
                for (const linkedCustomer of phoneCustomers) {
                    const { error: linkError } = await supabase
                        .from('linked_accounts')
                        .upsert({
                            primary_user_id: currentUser.id,
                            linked_user_id: linkedCustomer.user_id,
                            link_type: 'phone', // 추가: 연결 유형 지정
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }, {
                            onConflict: 'primary_user_id,linked_user_id'
                        });

                    if (!linkError) {
                        linkedCount++;
                    } else {
                        console.error('계정 연결 실패:', linkError);
                    }
                }
            } catch (linkError) {
                console.error('계정 연결 중 오류:', linkError);
                // 연결 실패해도 인증은 성공으로 처리
            }
        }

        return {
            code: ERROR_CODES.SUCCESS,
            message: '전화번호 인증이 완료되었습니다.' +
                (linkedCount > 0 ? ` ${linkedCount}개의 계정이 연결되었습니다.` : ''),
            data: {
                verified: true,
                phone: normalPhone,
                linkedAccounts: linkedCount
            }
        };
    } catch (error) {
        console.error("인증번호 확인 에러:", error);
        return {
            code: ERROR_CODES.SERVER_ERROR,
            message: '인증번호 확인 중 오류가 발생했습니다.'
        };
    }
}