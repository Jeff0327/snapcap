import {Database} from "@/types/supabase";

export type Products = Database['public']['Tables']['products']['Row'];
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
}