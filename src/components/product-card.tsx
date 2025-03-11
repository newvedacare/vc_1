"use client";

import { type Product } from "@/hooks/use-products";
import { cn } from "@/lib/utils";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { StarRating } from "@/components/star-rating";
import { useState, useEffect } from "react";
import { type CartItem } from "@/types/cart";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { cart, addToCart, updateQuantity } = useCart();
  const [localCart, setLocalCart] = useState(cart);
  const cartItem = localCart.items.find((item: CartItem) => item.id === product.id);

  useEffect(() => {
    setLocalCart(cart);
  }, [cart]);

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full">
      <div className="relative">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-64 object-cover"
        />
        {product.discount_percentage > 0 && (
          <div className="absolute top-4 right-4 bg-red-500 text-white text-sm px-2 py-1 rounded">
            {product.discount_percentage}% OFF
          </div>
        )}
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-gray-600 text-sm mt-2 flex-grow">{product.description}</p>
        
        <div className="mt-4">
          <StarRating 
            rating={product.averageRating || 0} 
            totalReviews={product.totalReviews || 0} 
          />
          
          <div className="flex items-center justify-between mt-4">
            <div>
              <span className="text-xl font-bold">₹{product.price}</span>
              {product.discount_percentage > 0 && (
                <>
                  <span className="text-gray-500 line-through text-sm ml-2">
                    ₹{product.original_price}
                  </span>
                  <span className="text-green-500 text-sm ml-2">
                    {product.discount_percentage}% OFF
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="w-full mt-4 flex items-center gap-2">
            {cartItem ? (
              <>
                <button 
                  onClick={() => updateQuantity(Number(cartItem.id), Math.max(0, cartItem.quantity - 1))}
                  className="p-2 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="flex-1 text-center font-medium">{cartItem.quantity}</span>
                <button 
                  onClick={() => updateQuantity(Number(cartItem.id), cartItem.quantity + 1)}
                  className="p-2 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button 
                onClick={() => {
                  const item = {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    original_price: product.original_price,
                    discount_percentage: product.discount_percentage,
                    image_url: product.image_url,
                    quantity: 1
                  };
                  addToCart(item);
                  toast.success(`${item.name} (Qty: ${item.quantity}) added to cart`);
                }}
                className="w-full bg-[#800000] text-white py-2 rounded flex items-center justify-center hover:bg-[#600000] transition-colors"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
