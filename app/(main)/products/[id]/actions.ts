'use server';

import {createClient} from "@/utils/server";
import {FormState} from "@/components/ui/form";
import {ERROR_CODES} from "@/utils/ErrorMessage";
import {ProductsJson} from "@/types";

export async function getOneProduct(id: string): Promise<FormState & { data?: ProductsJson }> {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error("상품 조회 오류:", error);
            return {
                code: ERROR_CODES.DB_ERROR,
                message: '상품을 불러오지 못하였습니다.',
                data: undefined
            };
        }

        return {
            code: ERROR_CODES.SUCCESS,
            message: '',
            data: data as ProductsJson
        };
    } catch (error) {
        console.error("상품 조회 중 예외 발생:", error);
        return {
            code: ERROR_CODES.SERVER_ERROR,
            message: '서버 에러가 발생하였습니다.',
            data: undefined
        };
    }
}