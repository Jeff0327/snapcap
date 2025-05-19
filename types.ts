// types.ts
import {Database} from "@/types/supabase";

export type Products = Database['public']['Tables']['products']['Row'];
export type Carts = Database['public']['Tables']['carts']['Row'];
export type Orders = Database['public']['Tables']['orders']['Row'];

export interface States {
    success: boolean;
    data: any | null;
    error: string | null;
}

export interface ColorOption {
    code: string;
    name: string;
}


export interface OrderCompleteView {
    order_id: string;
    order_number: string | null;
    total_amount: number;
    payment_method: string;
    payment_status: string;
    order_status: string;
    notes: string | null;
    order_created_at: string;
    order_updated_at: string | null;
    items_count: number;
    primary_product_name: string | null;
    primary_product_image: string | null;
    user_id: string;
    // 고객 정보
    customer_id: string | null;
    customer_name: string | null;
    customer_email: string | null;
    customer_phone: string | null;
    verified_phone: string | null;
    // 사용자 정보
    user_email: string | null;
    user_metadata: any;
    app_metadata: any;
    // 주소 정보
    address_id: string | null;
    recipient_name: string | null;
    phone_number: string | null;
    address_line1: string | null;
    address_line2: string | null;
    is_default_address: boolean | null;
    // 주문 상품 정보 (JSONB 배열)
    order_products: Array<{
        id: string;
        product_id: string;
        variant_id: string;
        quantity: number;
        price: number;
        product_name: string | null;
        product_image: string | null;
        color: string | null;
        color_code: string | null;
    }>;
}

export interface OrdersResponse {
    orders: OrderCompleteView[];
    error: string | null;
}

export type ProductsJson = Products & {
    colors: ColorOption[]
    variants?: Array<{
        id: string;
        color: string;
        color_code: string;
        inventory: number;
        is_active: boolean;
    }>
}

// The rest of your existing types...
export interface ColorVariant {
    color: string;
    colorCode: string;
    inventory: number | string;
}

export type CartItem = {
    id: string;
    user_id: string;
    product_id: string;
    variant_id: string;
    quantity: number;
    color: string;
    color_code: string;
    created_at?: string;
    updated_at?: string;
    product: {
        id: string;
        name: string;
        price: number;
        sale_price: number | null;
        images: string[];
        inventory: number;
        is_active: boolean;
    };
    product_variant: {
        id: string;
        product_id: string;
        color: string;
        color_code: string;
        inventory: number;
        is_active: boolean;
    };
};
//주소 타입
export interface DaumPostcodeData {
    address: string;
    addressType: string;
    buildingName: string;
    apartment?: string;
    zonecode: string;
    jibunAddress?: string;
    roadAddress?: string;
    autoJibunAddress?: string;
    autoRoadAddress?: string;
    userSelectedType?: string;
    bname?: string;
    bcode?: string;
}

declare global {
    interface Window {
        daum: DaumPostcodeInstance;
    }
}
//any 타입수정필요
declare global {
    interface Window {
        BootPay: any;
    }
}

export interface DaumPostcodeInstance {
    Postcode: new (options: DaumPostcodeOptions) => DaumPostcode;
}

export interface DaumPostcodeOptions {
    oncomplete: (data: DaumPostcodeData) => void;
    onresize?: (size: { width: number; height: number }) => void;
    onclose?: () => void;
    width?: string | number;
    height?: string | number;
    animation?: boolean;
    focusInput?: boolean;
    autoMapping?: boolean;
}

export interface DaumPostcode {
    open: () => void;
}

export interface PaymentItem {
    id: string;
    name: string;
    qty: number;
    price: number;
}

export interface UserInfo {
    id?: string;
    username?: string;
    phone?: string;
    email?: string;
}

export interface BootpayPaymentProps {
    applicationId: string;  // 부트페이 애플리케이션 ID
    price: number;          // 결제 금액
    orderName: string;      // 주문명
    orderId: string;        // 주문 ID
    pg?: string;            // PG사 (기본값: '다날')
    method?: string;        // 결제 수단 (기본값: '카드')
    taxFree?: number;       // 면세 금액
    user?: UserInfo;        // 유저 정보
    items?: PaymentItem[];  // 주문 아이템
    cardQuota?: string;     // 할부 개월 수
    escrow?: boolean;       // 에스크로 사용 여부
    openType?: string;      // 결제창 타입
    onSuccess?: (data: any) => void;  // 결제 성공 시 콜백
    onFailure?: (data: any) => void;  // 결제 실패 시 콜백
    onCancel?: (data: any) => void;   // 결제 취소 시 콜백
    onConfirm?: (data: any) => Promise<boolean>;  // 결제 승인 전 콜백
    onDone?: () => void;    // 결제 완료 시 콜백
    className?: string;     // 버튼 CSS 클래스
    buttonText?: string;    // 버튼 텍스트
    disabled?: boolean;     // 버튼 비활성화 여부
    formData: FormData;
}