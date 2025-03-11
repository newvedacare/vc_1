"use client";

import { useCart } from "@/hooks/use-cart";
import { Minus, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart } = useCart();

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-semibold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Browse our products and add some items to your cart.</p>
          <Link 
            href="/" 
            className="inline-block bg-[#800000] text-white px-6 py-2 rounded hover:bg-[#600000] transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-semibold mb-8">Your Cart</h1>
        <div className="space-y-6">
          {cart.items.map((item) => (
            <div key={item.id} className="flex gap-6 p-4 bg-white rounded-lg shadow-sm">
              <div className="w-24 h-24 relative overflow-hidden rounded">
                <img 
                  src={item.image_url} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{item.name}</h3>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                      className="p-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="ml-auto">
                    <span className="font-medium">₹{item.price * item.quantity}</span>
                    {item.discount_percentage > 0 && (
                      <>
                        <span className="text-gray-500 line-through text-sm ml-2">
                          ₹{item.original_price * item.quantity}
                        </span>
                        <span className="text-green-500 text-sm ml-2">
                          {item.discount_percentage}% OFF
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
          <div className="space-y-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{cart.total}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>GST (18% included in price)</span>
              <span>₹{(cart.total * 0.18).toFixed(2)}</span>
            </div>
            <div className="border-t pt-4 flex justify-between font-semibold">
              <span>Total (Incl. GST)</span>
              <span>₹{cart.total}</span>
            </div>
          </div>
          <button 
            onClick={async () => {
              try {
                const isAuthenticated = localStorage.getItem('isAuthenticated');
                const authToken = localStorage.getItem('supabase.auth.token');
                
                if (!isAuthenticated || !authToken) {
                  toast.error("Please log in to continue checkout");
                  router.push('/login?redirect=/checkout/address');
                  return;
                }

                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) {
                  localStorage.removeItem('isAuthenticated');
                  localStorage.removeItem('supabase.auth.token');
                  toast.error("Session expired. Please log in again");
                  router.push('/login?redirect=/checkout/address');
                  return;
                }

                router.push('/checkout/address');
                toast.success("Proceeding to address selection");
              } catch (error) {
                console.error('Checkout error:', error);
                toast.error("An error occurred. Please try again.");
              }
            }}
            className="w-full mt-6 bg-[#800000] text-white py-3 rounded font-medium hover:bg-[#600000] transition-colors"
          >
            Checkout
          </button>
          <Link 
            href="/"
            className="block w-full mt-4 text-center text-[#800000] hover:text-[#600000] transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
