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


// 장바구니 첫 상품명 + 추가 상품 수 형식으로 표시
export function getOrderName(items: CartItem[]): string {
    if (items.length === 0) return '상품 없음';

    const firstItem = items[0];
    const firstItemName = firstItem.product?.name || '알 수 없는 상품';

    if (items.length === 1) {
        return firstItemName;
    }

    return `${firstItemName} 외 ${items.length - 1}개`;
}

// 주문 상태 텍스트 변환
export function getOrderStatusText(status: string): string {
    switch(status) {
        case 'pending': return '주문 대기';
        case 'processing': return '처리 중';
        case 'shipped': return '배송 중';
        case 'delivered': return '배송 완료';
        case 'cancelled': return '주문 취소';
        case 'returned': return '반품';
        default: return status;
    }
}

// 결제 상태 텍스트 변환
export function getPaymentStatusText(status: string): string {
    switch(status) {
        case 'pending': return '결제 대기';
        case 'paid': return '결제 완료';
        case 'failed': return '결제 실패';
        case 'refunded': return '환불';
        default: return status;
    }
}

// 날짜 포맷팅
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 재고 체크 함수
export function checkInventory(item: CartItem): boolean {
    if (!item.product) return false;

    // 상품 재고 체크
    if (item.product.inventory < item.quantity) {
        return false;
    }

    // 변형 재고 체크 (있는 경우)
    if (item.product_variant && item.product_variant.inventory < item.quantity) {
        return false;
    }

    return true;
}

export function formatOrderNumber(uuid: string, digits: number = 6, position: 'start' | 'end' = 'end'): string {
    if (!uuid) return 'N/A';

    // UUID에서 하이픈 제거
    const cleanUuid = uuid.replace(/-/g, '');

    // 위치에 따라 처리
    if (position === 'start') {
        return cleanUuid.substring(0, digits).toUpperCase();
    } else {
        return cleanUuid.substring(cleanUuid.length - digits).toUpperCase();
    }
}

/**
 * 현재 날짜와 UUID를 조합한 주문번호 생성
 * @param uuid 주문 UUID
 * @param digits UUID에서 사용할 자릿수 (기본값: 6)
 * @returns 날짜 기반 주문번호 (예: 230511-AB12CD)
 */
export function formatOrderNumberWithDate(uuid: string, digits: number = 6): string {
    if (!uuid) return 'N/A';

    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');

    const datePrefix = `${year}${month}${day}`;
    const uuidPart = uuid.replace(/-/g, '').substring(0, digits).toUpperCase();

    return `${datePrefix}-${uuidPart}`;
}
export function formatToNormalPhone(phone: string): string {
    // E.164 형식이나 다른 형식에서 숫자만 추출
    const cleaned = phone.replace(/\D/g, '');

    // 국가 코드(82) 제거하고 앞에 0 추가
    if (cleaned.startsWith('82')) {
        return `0${cleaned.substring(2)}`;
    }

    // 이미 0으로 시작하거나 다른 형식이면 그대로 반환
    return cleaned;
}
// 전화번호를 E.164 형식으로 변환하는 함수
export function formatToE164(phone: string): string {
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
// 숫자 포맷팅 함수
export function formatNumber(num: number): string {
    return num.toLocaleString('ko-KR');
}

// 금액 포맷팅 함수
export function formatCurrency(amount: number): string {
    return `₩${amount.toLocaleString('ko-KR')}`;
}

// 월 이름 가져오기
export function getMonthName(month: number): string {
    const months = [
        '1월', '2월', '3월', '4월', '5월', '6월',
        '7월', '8월', '9월', '10월', '11월', '12월'
    ];
    return months[month];
}