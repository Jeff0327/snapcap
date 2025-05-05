'use server';

import { createClient } from "@/utils/server";
import { ProductsJson } from "@/types";
import {FormState} from "@/components/ui/form";
import {ERROR_CODES} from "@/utils/ErrorMessage";

export async function getProductsByType({ type }: { type: string }): Promise<ProductsJson[]> {
    const supabase = await createClient();

    try {
        // 기본 쿼리 시작
        let query = supabase
            .from('products')
            .select('*')
            .eq('is_active', true);

        // type이 'default'가 아닌 경우에만 type 필터 적용
        if (type !== 'default') {
            query = query.eq('type', type);
        }

        // 최신순 정렬 및 데이터 가져오기
        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('상품 조회 오류:', error);
            return [];
        }

        return data as ProductsJson[];
    } catch (error) {
        console.error('상품 조회 중 예외 발생:', error);
        return [];
    }
}

//상품 검색
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