"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Cart } from "@/types/cart";
import { toast } from "sonner";
import { Address } from "./use-addresses";

export function useOrders() {
  const [loading, setLoading] = useState(false);

  const createOrder = async (userId: string, address: Address, cart: Cart) => {
    setLoading(true);
    try {
      // Format address for storage
      const addressData = {
        name: address.name,
        address_line: address.address_line,
        city: address.city,
        state: address.state,
        postal_code: address.postal_code
      };

      // Create order with JSON address data
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          shipping_address: JSON.stringify(addressData),
          billing_address: JSON.stringify(addressData),
          total_amount: cart.total,
          payment_status: 'pending',
          payment_method: 'online',
          order_date: new Date().toISOString(),
          order_status: 'pending'
        })
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw orderError;
      }

      // Create order items
      const orderItems = cart.items.map(item => ({
        order_id: order.order_id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      // Insert order items directly
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart after successful order
      localStorage.removeItem('mukorossi_cart');

      toast.success("Order placed successfully!");
      return { success: true, orderId: order.order_id };
    } catch (error) {
      console.error("Order creation error:", error);
      toast.error("Failed to create order. Please try again.");
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    createOrder,
    loading
  };
}
