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
export type OrderProduct = {
    id: string;
    order_id: string;
    product_id: string;
    variant_id: string;
    quantity: number;
    price: number;
    color: string | null;
    color_code: string | null;
    created_at: string;

    // 추가된 필드
    product_name: string;          // 상품 이름 저장
    product_image: string;         // 대표 이미지 URL 저장
    variant_name: string | null;   // 변형 이름 (예: "블랙 / L")
    original_price: number;        // 할인 전 원래 가격

    // JOIN 할 때 사용되는 관계형 객체 (선택적)
    product?: {
        id: string;
        name: string;
        price: number;
        sale_price: number | null;
        images: string[];
        inventory: number;
        is_active: boolean;
    };

    product_variant?: {
        id: string;
        product_id: string;
        color: string;
        color_code: string;
        inventory: number;
        is_active: boolean;
    };
};
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