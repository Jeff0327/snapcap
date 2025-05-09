'use server';

import { createClient } from "@/utils/server";
import { revalidatePath } from "next/cache";
import { getCartItems } from "@/app/(main)/cart/actions";
import { ERROR_CODES } from "@/utils/ErrorMessage";
import { FormState } from "@/components/ui/form";

export async function createOrder(formData: FormData): Promise<FormState> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const recipientName = formData.get('recipientName') as string;
    const addressLine1 = formData.get('address') as string;
    const addressLine2 = formData.get('addressDetail') as string || '';
    const phoneNumber = formData.get('phoneNumber') as string;
    const notes = formData.get('notes') as string || '';


    if (!user) {
        return {
            code: ERROR_CODES.AUTH_ERROR,
            message: '로그인이 필요합니다.'
        };
    }

    if (!recipientName || !addressLine1 || !addressLine2 ||!phoneNumber) {
        return {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: '필수값이 입력되지않았습니다.'
        };
    }

    try {
        // 1. customer 정보 조회 또는 생성
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
                    name: recipientName,
                    email: user.email || '',
                    phone: phoneNumber
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
        }

        // 2. 주소 정보 저장
        const { data: address, error: addressError } = await supabase
            .from('addresses')
            .insert({
                customer_id: customer.id,
                recipient_name: recipientName,
                phone_number: phoneNumber,
                address_line1: addressLine1,
                address_line2: addressLine2,
                is_default: false // 일단 기본 주소가 아닌 것으로 설정
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

        // 3. 카트 아이템 조회
        const items = await getCartItems(user.id);

        if (items.length === 0) {
            return {
                code: ERROR_CODES.VALIDATION_ERROR,
                message: '장바구니가 비어있습니다.'
            };
        }

        // 4. 주문 생성
        // const { data: order, error: orderError } = await supabase
        //     .from('orders')
        //     .insert({
        //         user_id: user.id,
        //         address_id: address.id,
        //         total_amount: items,
        //         final_amount: finalAmount,
        //         payment_method: paymentMethod,
        //         payment_status: 'paid', // 테스트에서는 결제 취소 시에도 paid로 설정
        //         order_status: 'processing',
        //         notes: notes
        //     })
        //     .select()
        //     .single();

        // if (orderError) {
        //     console.error('Failed to create order:', orderError);
        //     return {
        //         code: ERROR_CODES.DB_ERROR,
        //         message: '주문 생성에 실패했습니다.'
        //     };
        // }

        // 5. 주문 아이템 생성 로직을 여기에 추가할 수 있습니다
        // (order_items 테이블이 있다면)

        // 6. 카트 비우기
        const { error: clearCartError } = await supabase
            .from('carts')
            .delete()
            .eq('user_id', user.id);

        if (clearCartError) {
            console.error('Failed to clear cart:', clearCartError);
        }

        // 페이지 리프레시
        revalidatePath('/cart');
        revalidatePath('/orders');

        return {
            code: ERROR_CODES.SUCCESS,
            message: '배송지 입력이 완료되었습니다..'
        };
    } catch (error) {
        console.error('Order creation error:', error);
        return {
            code: ERROR_CODES.SERVER_ERROR,
            message: '서버 에러가 발생하였습니다.'
        };
    }
}