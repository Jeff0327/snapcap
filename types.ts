import {Database} from "@/types/supabase";

export type Products = Database['public']['Tables']['products']['Row'];
export type Carts = Database['public']['Tables']['carts']['Row'];
export interface States {
    success: boolean;
    data: any | null;
    error: string | null;
}
export interface ColorOption {
    code: string;
    name: string;
}
export type ProductsJson = Products & {
    colors:ColorOption[]
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
    product_id: string;
    quantity: number;
    color: string;
    color_code: string;
    product?: {
        id: string;
        name: string;
        price: number;
        sale_price: number | null;
        images: string[];
        inventory: number;
    }
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
