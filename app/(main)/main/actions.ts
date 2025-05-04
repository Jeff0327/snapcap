'use server';

import { createClient } from "@/utils/server";
import { ERROR_CODES } from "@/utils/ErrorMessage";
import {FormState} from "@/components/ui/form";
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

export async function searchProduct(formData: FormData): Promise<FormState> {
    const searchTerm = formData.get('searchTerm') as string;

    if (!searchTerm || searchTerm.trim() === '') {
        return {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: '검색어를 입력해주세요.'
        };
    }

    try {
        // Supabase 클라이언트 생성
        const supabase = await createClient();

        // 검색어로 상품 검색
        const { data, error } = await supabase
            .from('products')
            .select('id')
            .ilike('name', `%${searchTerm}%`)
            .limit(1);

        if (error) {
            console.error('검색 오류:', error);
            return {
                code: ERROR_CODES.DB_ERROR,
                message: '검색 중 오류가 발생했습니다.'
            };
        }

        if (data && data.length > 0) {
            // 검색 결과가 있으면 해당 상품 페이지로 리다이렉트
            return {
                code: ERROR_CODES.SUCCESS,
                message: '검색 성공',
                redirect: `/products/${data[0].id}`,
            };
        } else {
            // 검색 결과가 없으면 검색 페이지로 리다이렉트
            return {
                code: ERROR_CODES.DB_ERROR,
                message: '검색 결과가 없습니다.',
            };
        }
    } catch (error) {
        console.error('검색 처리 중 오류 발생:', error);
        return {
            code: ERROR_CODES.SERVER_ERROR,
            message: '서버 오류가 발생했습니다.'
        };
    }
}