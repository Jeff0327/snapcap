// app/(main)/order/[id]/actions.ts
'use server';

import { z } from "zod";
import { createClient } from "@/utils/server";
import { ERROR_CODES } from "@/utils/ErrorMessage";
import { FormState } from "@/components/ui/form";

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


// 인증번호 확인
export async function verifyPhoneCode(phone: string, otp:string): Promise<FormState> {
    if(!phone || !otp){
        return {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: '인증번호를 입력해주세요.'
        }
    }

    const validationResult = OtpVerificationSchema.safeParse({
        phone: phone.replace(/^\+/, ''), // 이건 의미 없어짐
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
        const e164Phone = formatToE164(phone); // ✅ 추가

        const { data, error } = await supabase.auth.verifyOtp({
            phone: e164Phone, // ✅ 수정
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

        return {
            code: ERROR_CODES.SUCCESS,
            message: '전화번호 인증이 완료되었습니다.',
            data: { session: data.session }
        };
    } catch (error) {
        console.error("인증번호 확인 에러:", error);
        return {
            code: ERROR_CODES.SERVER_ERROR,
            message: '인증번호 확인 중 오류가 발생했습니다.'
        };
    }
}
