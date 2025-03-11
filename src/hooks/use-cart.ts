"use client";

import { useEffect, useState } from "react";
import { Cart, CartItem } from "@/types/cart";
import { toast } from "sonner";

const CART_STORAGE_KEY = "mukorossi_cart";

const initialCart: Cart = {
  items: [],
  total: 0,
  itemCount: 0
};

export function useCart() {
  const [cart, setCart] = useState<Cart>(initialCart);
  const [loading, setLoading] = useState(true);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    setLoading(false);
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart, loading]);

  const addToCart = (product: CartItem) => {
    const newCart = {
      items: (() => {
        const existingItem = cart.items.find(item => item.id === product.id);
        if (existingItem) {
          return cart.items.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...cart.items, { ...product, quantity: 1 }];
      })(),
      total: 0,
      itemCount: 0
    };
    
    // Calculate totals after updating items
    newCart.total = calculateTotal(newCart.items);
    newCart.itemCount = calculateItemCount(newCart.items);
    
    // Update state and storage synchronously
    setCart(newCart);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
    toast.success("Added to cart");
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) return;
    
    setCart(prevCart => {
      const updatedItems = prevCart.items.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      );
      return {
        items: updatedItems,
        total: calculateTotal(updatedItems),
        itemCount: calculateItemCount(updatedItems)
      };
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prevCart => {
      const updatedItems = prevCart.items.filter(item => item.id !== productId);
      return {
        items: updatedItems,
        total: calculateTotal(updatedItems),
        itemCount: calculateItemCount(updatedItems)
      };
    });
    toast.success("Removed from cart");
  };

  const calculateTotal = (items: CartItem[]) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateItemCount = (items: CartItem[]) => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    loading
  };
}
