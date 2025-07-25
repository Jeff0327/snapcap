export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          created_at: string
          customer_id: string
          id: string
          is_default: boolean
          phone_number: string
          recipient_name: string
          updated_at: string | null
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          created_at?: string
          customer_id: string
          id?: string
          is_default?: boolean
          phone_number: string
          recipient_name: string
          updated_at?: string | null
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          is_default?: boolean
          phone_number?: string
          recipient_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "orders_complete_view"
            referencedColumns: ["customer_id"]
          },
        ]
      }
      carts: {
        Row: {
          color: string
          color_code: string
          created_at: string | null
          id: string
          product_id: string
          quantity: number
          updated_at: string | null
          user_id: string
          variant_id: string
        }
        Insert: {
          color: string
          color_code: string
          created_at?: string | null
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string | null
          user_id: string
          variant_id: string
        }
        Update: {
          color?: string
          color_code?: string
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string | null
          user_id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carts_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_products_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          phone_verified_at: string | null
          updated_at: string | null
          user_id: string
          verified_phone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          phone_verified_at?: string | null
          updated_at?: string | null
          user_id: string
          verified_phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          phone_verified_at?: string | null
          updated_at?: string | null
          user_id?: string
          verified_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      linked_accounts: {
        Row: {
          created_at: string
          id: string
          link_data: Json | null
          link_type: string | null
          linked_user_id: string
          primary_user_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          link_data?: Json | null
          link_type?: string | null
          linked_user_id: string
          primary_user_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          link_data?: Json | null
          link_type?: string | null
          linked_user_id?: string
          primary_user_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "linked_accounts_linked_user_id_fkey"
            columns: ["linked_user_id"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "linked_accounts_primary_user_id_fkey"
            columns: ["primary_user_id"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      order_products: {
        Row: {
          color: string | null
          color_code: string | null
          created_at: string
          id: string
          order_id: string
          original_price: number | null
          price: number
          product_id: string
          product_image: string | null
          product_name: string | null
          quantity: number
          variant_id: string
          variant_name: string | null
        }
        Insert: {
          color?: string | null
          color_code?: string | null
          created_at?: string
          id?: string
          order_id: string
          original_price?: number | null
          price: number
          product_id: string
          product_image?: string | null
          product_name?: string | null
          quantity?: number
          variant_id: string
          variant_name?: string | null
        }
        Update: {
          color?: string | null
          color_code?: string | null
          created_at?: string
          id?: string
          order_id?: string
          original_price?: number | null
          price?: number
          product_id?: string
          product_image?: string | null
          product_name?: string | null
          quantity?: number
          variant_id?: string
          variant_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_products_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_products_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_complete_view"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "order_products_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_with_products_and_addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_products_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_id: string
          created_at: string
          id: string
          items_count: number
          notes: string | null
          order_number: string | null
          order_status: string
          payment_method: string
          payment_status: string
          primary_product_image: string | null
          primary_product_name: string | null
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address_id: string
          created_at?: string
          id?: string
          items_count?: number
          notes?: string | null
          order_number?: string | null
          order_status?: string
          payment_method: string
          payment_status?: string
          primary_product_image?: string | null
          primary_product_name?: string | null
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address_id?: string
          created_at?: string
          id?: string
          items_count?: number
          notes?: string | null
          order_number?: string | null
          order_status?: string
          payment_method?: string
          payment_status?: string
          primary_product_image?: string | null
          primary_product_name?: string | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "orders_complete_view"
            referencedColumns: ["address_id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          color: string | null
          color_code: string | null
          created_at: string | null
          id: string
          inventory: number
          is_active: boolean | null
          product_id: string | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          color_code?: string | null
          created_at?: string | null
          id?: string
          inventory?: number
          is_active?: boolean | null
          product_id?: string | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          color_code?: string | null
          created_at?: string | null
          id?: string
          inventory?: number
          is_active?: boolean | null
          product_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          colors: Json | null
          created_at: string
          description: string | null
          id: string
          images: string[]
          inventory: number
          is_active: boolean
          name: string
          price: number
          sale_price: number | null
          sku: string | null
          tags: string[] | null
          type: string
          updated_at: string | null
        }
        Insert: {
          colors?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          images: string[]
          inventory?: number
          is_active?: boolean
          name: string
          price: number
          sale_price?: number | null
          sku?: string | null
          tags?: string[] | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          colors?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[]
          inventory?: number
          is_active?: boolean
          name?: string
          price?: number
          sale_price?: number | null
          sku?: string | null
          tags?: string[] | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      verification_codes: {
        Row: {
          code: string
          created_at: string | null
          expires_at: string
          id: string
          identifier: string
          is_used: boolean | null
          type: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          expires_at: string
          id?: string
          identifier: string
          is_used?: boolean | null
          type: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          identifier?: string
          is_used?: boolean | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      auth_users_view: {
        Row: {
          created_at: string | null
          email: string | null
          id: string | null
          raw_app_meta_data: Json | null
          raw_user_meta_data: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      orders_complete_view: {
        Row: {
          address_id: string | null
          address_line1: string | null
          address_line2: string | null
          app_metadata: Json | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          is_default_address: boolean | null
          items_count: number | null
          notes: string | null
          order_created_at: string | null
          order_id: string | null
          order_number: string | null
          order_products: Json | null
          order_status: string | null
          order_updated_at: string | null
          payment_method: string | null
          payment_status: string | null
          phone_number: string | null
          primary_product_image: string | null
          primary_product_name: string | null
          recipient_name: string | null
          total_amount: number | null
          user_email: string | null
          user_id: string | null
          user_metadata: Json | null
          verified_phone: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
      }
      orders_with_products_and_addresses: {
        Row: {
          address: Json | null
          address_id: string | null
          created_at: string | null
          id: string | null
          items_count: number | null
          notes: string | null
          order_number: string | null
          order_products: Json | null
          order_status: string | null
          payment_method: string | null
          payment_status: string | null
          primary_product_image: string | null
          primary_product_name: string | null
          total_amount: number | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "orders_complete_view"
            referencedColumns: ["address_id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth_users_view"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      cleanup_verification_codes: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      create_linked_accounts_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_expired_verification_codes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_all_order_details: {
        Args: Record<PropertyKey, never>
        Returns: Json[]
      }
      get_monthly_sales: {
        Args: { months_count?: number }
        Returns: {
          month: string
          revenue: number
          orders: number
        }[]
      }
      get_order_status_distribution: {
        Args: Record<PropertyKey, never>
        Returns: {
          status: string
          count: number
        }[]
      }
      get_orders_with_relations: {
        Args: Record<PropertyKey, never>
        Returns: Json[]
      }
      get_top_products: {
        Args: { limit_count?: number }
        Returns: {
          product_id: string
          product_name: string
          total_quantity: number
          total_sales: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
