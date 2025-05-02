'use server';

import { createClient } from "@/utils/server";
import { ERROR_CODES } from "@/utils/ErrorMessage";
import { FormState } from "@/components/ui/form";

// 상품 목록 가져오기
export async function ProductList() {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)  // 활성화된 상품만 가져오기
            .order('created_at', { ascending: false });

        if (error) {
            console.error('상품 목록 조회 오류:', error);
            return {
                code: ERROR_CODES.DB_ERROR,
                message: '상품목록을 가져오는 중 에러가 발생하였습니다.',
                data: []
            };
        }

        return {
            code: ERROR_CODES.SUCCESS,
            message: '',
            data
        };
    } catch (error) {
        console.error('상품 목록 조회 중 예외 발생:', error);
        return {
            code: ERROR_CODES.SERVER_ERROR,
            message: '서버 에러가 발생하였습니다.',
            data: []
        };
    }
}