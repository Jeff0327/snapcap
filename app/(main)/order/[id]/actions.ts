// app/(main)/order/[id]/actions.ts
'use server';

import { z } from "zod";
import { createClient } from "@/utils/server";
import { ERROR_CODES } from "@/utils/ErrorMessage";
import { FormState } from "@/components/ui/form";
import {formatToNormalPhone} from "@/utils/utils";

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

// 전화번호를 E.164 형식으로 변환하는 함수
function formatToE164(phone: string): string {
    // 전화번호에서 하이픈 등 숫자 외의 문자 제거
    const cleaned = phone.replace(/\D/g, '');

    // 한국 번호 형식 처리
    if (cleaned.startsWith('0')) {
        // 0으로 시작하면 국가 코드(+82)로 변환하고 첫 0 제거
        return `+82${cleaned.substring(1)}`;
    } else if (!cleaned.startsWith('82')) {
        // 82로 시작하지 않으면 +82 추가
        return `+82${cleaned}`;
    } else {
        // 이미 82로 시작하면 + 추가
        return `+${cleaned}`;
    }
}

// 전화번호 인증 코드 전송
export async function sendVerificationCode(phone: string): Promise<FormState> {
    const validationResult = PhoneSchema.safeParse({ phone });

    if (!validationResult.success) {
        return {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: '전화번호 형식이 올바르지 않습니다.',
        };
    }

    try {
        const supabase = await createClient();
        const e164Phone = formatToE164(phone);

        const { error } = await supabase.auth.signInWithOtp({ phone: e164Phone });

        if (error) {
            return {
                code: ERROR_CODES.DB_ERROR,
                message: `인증번호 전송에 실패했습니다: ${error.message}`,
            };
        }

        return {
            code: ERROR_CODES.SUCCESS,
            message: '인증번호가 발송되었습니다.',
        };
    } catch (error) {
        return {
            code: ERROR_CODES.SERVER_ERROR,
            message: '인증번호 발송 중 오류가 발생했습니다.',
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
        const e164Phone = formatToE164(phone);
        const normalPhone = formatToNormalPhone(phone);

        // 1. OTP 인증
        const { data, error } = await supabase.auth.verifyOtp({
            phone: e164Phone,
            token: otp,
            type: 'sms'
        });

        if (error) {
            console.error("OTP 확인 에러:", error);
            return {
                code: ERROR_CODES.DB_ERROR,
                message: '인증번호가 일치하지 않습니다.'
            };
        }

        // 2. 현재 로그인한 사용자 정보 가져오기
        const { data: { user: currentUser } } = await supabase.auth.getUser();

        if (!currentUser) {
            return {
                code: ERROR_CODES.AUTH_ERROR,
                message: '로그인이 필요합니다.'
            };
        }

        // 3. auth.users 테이블은 직접 접근할 수 없으므로 대신 customers 테이블을 활용
        // 동일한 전화번호를 가진 customers 계정 찾기
        const { data: phoneCustomers } = await supabase
            .from('customers')
            .select('user_id')
            .eq('phone', normalPhone)
            .neq('user_id', currentUser.id); // 현재 사용자 제외

        // 4. 현재 사용자의 customers 정보 업데이트 (전화번호 추가)
        const { data: existingCustomer } = await supabase
            .from('customers')
            .select('id')
            .eq('user_id', currentUser.id)
            .single();

        if (existingCustomer) {
            // 기존 고객 정보 업데이트
            await supabase
                .from('customers')
                .update({ phone: normalPhone })
                .eq('id', existingCustomer.id);
        } else {
            // 고객 정보가 없으면 새로 생성
            // 고객 이름, 이메일 등이 필요하므로 현재 사용자 정보에서 가져옴
            const userMetadata = currentUser.user_metadata || {};

            await supabase
                .from('customers')
                .insert({
                    user_id: currentUser.id,
                    name: userMetadata.full_name || 'Guest',
                    email: currentUser.email || '',
                    phone: normalPhone
                });
        }

        // 5. 찾은 계정들의 user_id 수집
        const relatedUserIds = (phoneCustomers || []).map(c => c.user_id);

        // 6. linked_accounts 테이블 생성 (없는 경우)
        const { error: tableCheckError } = await supabase
            .from('linked_accounts')
            .select('id')
            .limit(1);

        if (tableCheckError && tableCheckError.message.includes('does not exist')) {
            // 테이블이 없으면 생성 시도 건너뜀
            console.log('linked_accounts 테이블이 없습니다. 관리자에게 테이블 생성을 요청하세요.');
        }

        // 7. 연결 테이블에 관계 추가 시도
        if (relatedUserIds.length > 0 && !tableCheckError) {
            try {
                for (const linkedUserId of relatedUserIds) {
                    // linked_accounts 테이블이 있으면 연결 추가
                    const { error: linkError } = await supabase
                        .from('linked_accounts')
                        .upsert({
                            primary_user_id: currentUser.id,
                            linked_user_id: linkedUserId
                        }, {
                            onConflict: 'primary_user_id,linked_user_id'
                        });

                    if (linkError) {
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
            message: '전화번호 인증이 완료되었습니다.',
            data: {
                session: data.session,
                linkedAccounts: relatedUserIds.length
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

// linked_accounts 테이블이 없을 경우 생성하는 함수 (RLS용)
export async function createLinkedAccountsTable(): Promise<FormState> {
    try {
        const supabase = await createClient();

        // SQL 함수를 통해 테이블 생성 (관리자 권한 필요)
        await supabase.rpc('create_linked_accounts_table');

        return {
            code: ERROR_CODES.SUCCESS,
            message: 'linked_accounts 테이블이 생성되었습니다.'
        };
    } catch (error) {
        console.error('테이블 생성 오류:', error);
        return {
            code: ERROR_CODES.SERVER_ERROR,
            message: '테이블 생성 중 오류가 발생했습니다.'
        };
    }
}
