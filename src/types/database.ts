export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          role: "customer" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          role?: "customer" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      products: {
        Row: ProductRow;
        Insert: Partial<ProductRow> & {
          name: string;
          slug: string;
          description: string;
          price_cents: number;
        };
        Update: Partial<ProductRow>;
        Relationships: [];
      };
      product_variants: {
        Row: ProductVariantRow;
        Insert: Partial<ProductVariantRow> & {
          product_id: string;
          size: string;
          color: string;
        };
        Update: Partial<ProductVariantRow>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          status: "pending_payment" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
          payment_status: "pending" | "paid" | "failed" | "expired" | "refunded" | "disputed";
          total_cents: number;
          abacatepay_checkout_id: string | null;
          abacatepay_checkout_url: string | null;
          abacatepay_payload: Json | null;
          customer_email: string | null;
          customer_name: string | null;
          expires_at: string;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["orders"]["Row"]> & {
          total_cents: number;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          variant_id: string | null;
          product_name: string;
          size: string;
          color: string;
          image_url: string | null;
          quantity: number;
          unit_price_cents: number;
          total_cents: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          variant_id?: string | null;
          product_name: string;
          size: string;
          color: string;
          image_url?: string | null;
          quantity: number;
          unit_price_cents: number;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
        Relationships: [];
      };
      stock_reservations: {
        Row: {
          id: string;
          order_id: string;
          variant_id: string;
          quantity: number;
          status: "active" | "converted" | "released" | "expired";
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          variant_id: string;
          quantity: number;
          status?: "active" | "converted" | "released" | "expired";
          expires_at: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["stock_reservations"]["Insert"]>;
        Relationships: [];
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["favorites"]["Insert"]>;
        Relationships: [];
      };
      webhook_events: {
        Row: {
          id: string;
          provider: string;
          event: string;
          payload: Json;
          processed_at: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          provider: string;
          event: string;
          payload: Json;
          processed_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["webhook_events"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      reserve_order_stock: {
        Args: {
          p_items: Json;
          p_user_id: string | null;
          p_customer_email?: string | null;
          p_customer_name?: string | null;
        };
        Returns: string;
      };
      confirm_order_payment: {
        Args: {
          p_order_id: string;
          p_checkout_id: string | null;
          p_payload: Json;
        };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type ProductRow = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string;
  price_cents: number;
  images: string[];
  active: boolean;
  abacatepay_product_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductVariantRow = {
  id: string;
  product_id: string;
  size: string;
  color: string;
  color_hex: string | null;
  sku: string | null;
  stock_quantity: number;
  reserved_quantity: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};
