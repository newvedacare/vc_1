export interface CartItem {
  id: number;
  name: string;
  price: number;
  original_price: number;
  discount_percentage: number;
  image_url: string;
  quantity: number;
  completed?: boolean;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}
