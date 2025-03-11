export interface DatabaseAddress {
  id: string;
  user_id: string;
  name: string;
  address_line: string;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  order_id: string;
  product_id: number;
  quantity: number;
  price: number;
  created_at?: string;
}
