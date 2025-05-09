// 가격 포맷팅 함수
import {CartItem, Products} from "@/types";

// 할인율 계산
export const getDiscountRate = (product:Products) => {
    if (!product.sale_price || product.sale_price >= product.price) return null;
    return Math.round((1 - Number(product.sale_price) / Number(product.price)) * 100);
};
// 가격 포맷팅 함수
export const formatPrice = (price: number) => {
    if (!price) return '-';
    return new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW',
        maximumFractionDigits: 0
    }).format(Number(price));
};
// 주문 상품명 생성 (첫 번째 상품명 + 나머지 수량)
export const getOrderName = (cartItems:CartItem[]) => {
    if (cartItems.length === 0) return '';
    if (cartItems.length === 1) return cartItems[0].product?.name || '';

    const firstItemName = cartItems[0].product?.name || '';
    const remainingCount = cartItems.length - 1;
    return `${firstItemName} 외 ${remainingCount}건`;
};
// 총 상품 수량 계산
export const getTotalQuantity = (cartItems:CartItem[]) => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
};
// 총 가격 계산
export const getTotalPrice = (cartItems:CartItem[]) => {
    return cartItems.reduce((total, item) => {
        if (!item.product) return total;
        const price = item.product.sale_price || item.product.price;
        return total + (price * item.quantity);
    }, 0);
};