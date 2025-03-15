
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          address_line: string
          city: string
          created_at: string
          id: number
          is_default: boolean | null
          name: string
          postal_code: string
          state: string
          street: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address_line: string
          city: string
          created_at?: string
          id?: never
          is_default?: boolean | null
          name: string
          postal_code: string
          state: string
          street?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address_line?: string
          city?: string
          created_at?: string
          id?: never
          is_default?: boolean | null
          name?: string
          postal_code?: string
          state?: string
          street?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      cart: {
        Row: {
          completed: boolean | null
          created_at: string | null
          discount_percentage: number | null
          gst_amount: number | null
          gst_percentage: number | null
          id: number
          image_url: string | null
          name: string | null
          original_price: number
          price: number
          product_id: number
          quantity: number
          total_price: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          discount_percentage?: number | null
          gst_amount?: number | null
          gst_percentage?: number | null
          id?: never
          image_url?: string | null
          name?: string | null
          original_price: number
          price: number
          product_id: number
          quantity?: number
          total_price?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          discount_percentage?: number | null
          gst_amount?: number | null
          gst_percentage?: number | null
          id?: never
          image_url?: string | null
          name?: string | null
          original_price?: number
          price?: number
          product_id?: number
          quantity?: number
          total_price?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_events: {
        Row: {
          created_at: string | null
          created_by: string | null
          event_data: Json | null
          event_type: string
          id: number
          order_id: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          event_data?: Json | null
          event_type: string
          id?: never
          order_id?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          event_data?: Json | null
          event_type?: string
          id?: never
          order_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["order_id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: number
          order_id: number | null
          price: number
          product_id: number | null
          quantity: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: never
          order_id?: number | null
          price: number
          product_id?: number | null
          quantity: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: never
          order_id?: number | null
          price?: number
          product_id?: number | null
          quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          actual_delivery_date: string | null
          billing_address: string
          created_at: string
          current_location: string | null
          current_status: string | null
          current_status_code: string | null
          current_status_text: string | null
          discount_amount: number | null
          estimated_delivery_date: string | null
          events: Json[] | null
          expected_delivery_date: string | null
          notes: string | null
          order_date: string
          order_id: number
          order_status: string
          payment_method: string
          payment_status: string
          shipping_address: string
          shipping_cost: number | null
          shipping_method: string | null
          tax_amount: number | null
          total_amount: number
          tracking_number: string | null
          transaction_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          actual_delivery_date?: string | null
          billing_address: string
          created_at?: string
          current_location?: string | null
          current_status?: string | null
          current_status_code?: string | null
          current_status_text?: string | null
          discount_amount?: number | null
          estimated_delivery_date?: string | null
          events?: Json[] | null
          expected_delivery_date?: string | null
          notes?: string | null
          order_date?: string
          order_id?: number
          order_status?: string
          payment_method: string
          payment_status?: string
          shipping_address: string
          shipping_cost?: number | null
          shipping_method?: string | null
          tax_amount?: number | null
          total_amount: number
          tracking_number?: string | null
          transaction_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          actual_delivery_date?: string | null
          billing_address?: string
          created_at?: string
          current_location?: string | null
          current_status?: string | null
          current_status_code?: string | null
          current_status_text?: string | null
          discount_amount?: number | null
          estimated_delivery_date?: string | null
          events?: Json[] | null
          expected_delivery_date?: string | null
          notes?: string | null
          order_date?: string
          order_id?: number
          order_status?: string
          payment_method?: string
          payment_status?: string
          shipping_address?: string
          shipping_cost?: number | null
          shipping_method?: string | null
          tax_amount?: number | null
          total_amount?: number
          tracking_number?: string | null
          transaction_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["merchant_transaction_id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          error_details: Json | null
          id: number
          last_verified_at: string | null
          merchant_id: string
          merchant_transaction_id: string
          merchant_user_id: string
          mobile_number: string | null
          payment_instrument_details: Json | null
          payment_instrument_type: string | null
          payment_state: string | null
          phonepe_payload: Json | null
          phonepe_response: Json | null
          salt: string | null
          status: string
          updated_at: string
          user_id: string
          verification_attempts: number | null
          x_verify_token: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          error_details?: Json | null
          id?: never
          last_verified_at?: string | null
          merchant_id: string
          merchant_transaction_id: string
          merchant_user_id: string
          mobile_number?: string | null
          payment_instrument_details?: Json | null
          payment_instrument_type?: string | null
          payment_state?: string | null
          phonepe_payload?: Json | null
          phonepe_response?: Json | null
          salt?: string | null
          status?: string
          updated_at?: string
          user_id: string
          verification_attempts?: number | null
          x_verify_token?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          error_details?: Json | null
          id?: never
          last_verified_at?: string | null
          merchant_id?: string
          merchant_transaction_id?: string
          merchant_user_id?: string
          mobile_number?: string | null
          payment_instrument_details?: Json | null
          payment_instrument_type?: string | null
          payment_state?: string | null
          phonepe_payload?: Json | null
          phonepe_response?: Json | null
          salt?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          verification_attempts?: number | null
          x_verify_token?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          average_rating: number | null
          category: string
          created_at: string | null
          description: string
          discount_percentage: number
          end_date: string | null
          final_price: number | null
          id: number
          image_url: string
          name: string
          original_price: number
          price: number
          product_id: number
          rating: number
          start_date: string
          total_reviews: number | null
          updated_at: string | null
          version: number
        }
        Insert: {
          average_rating?: number | null
          category: string
          created_at?: string | null
          description: string
          discount_percentage?: number
          end_date?: string | null
          final_price?: number | null
          id?: never
          image_url: string
          name: string
          original_price: number
          price: number
          product_id: number
          rating?: number
          start_date: string
          total_reviews?: number | null
          updated_at?: string | null
          version: number
        }
        Update: {
          average_rating?: number | null
          category?: string
          created_at?: string | null
          description?: string
          discount_percentage?: number
          end_date?: string | null
          final_price?: number | null
          id?: never
          image_url?: string
          name?: string
          original_price?: number
          price?: number
          product_id?: number
          rating?: number
          start_date?: string
          total_reviews?: number | null
          updated_at?: string | null
          version?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string | null
          id: string
          product_id: number
          rating: number
          review_text: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: number
          rating: number
          review_text?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: number
          rating?: number
          review_text?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_order_items: {
        Args: {
          items: Json
        }
        Returns: undefined
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
