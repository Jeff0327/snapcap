// 가격 포맷팅 함수
import {Products} from "@/types";

export const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW',
        maximumFractionDigits: 0
    }).format(Number(price));
};
// 할인율 계산
export const getDiscountRate = (product:Products) => {
    if (!product.sale_price || product.sale_price >= product.price) return null;
    return Math.round((1 - Number(product.sale_price) / Number(product.price)) * 100);
};
