"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/hooks/use-cart";
import { useOrders } from "@/hooks/use-orders";
import { Address } from "@/hooks/use-addresses";
import { usePayment } from "@/hooks/use-payment";
import { toast } from "sonner";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { cart } = useCart();
  const { createOrder } = useOrders();
  const { initializePayment } = usePayment();
  const addressId = searchParams?.get('address');

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/checkout/payment');
      return;
    }

    if (!addressId) {
      router.push('/checkout/address');
      return;
    }
  }, [user, addressId, router]);

  const handlePayment = async () => {
    try {
      if (!user?.id) {
        toast.error("Please log in to continue");
        router.push('/login');
        return;
      }

      if (!addressId) {
        toast.error("Please select a delivery address");
        router.push('/checkout/address');
        return;
      }

      // Get address details
      const { data: addressData, error: addressError } = await supabase
        .from('addresses')
        .select('*')
        .eq('id', parseInt(addressId || '0'))
        .single();

      if (addressError || !addressData) {
        throw new Error('Invalid address');
      }

      // Convert database address to Address interface
      const address: Address = {
        ...addressData,
        id: addressData.id.toString()
      };

      // Validate cart
      if (cart.items.length === 0) {
        toast.error("Your cart is empty");
        router.push('/cart');
        return;
      }

      // Create order first
      const orderResult = await createOrder(user.id, address, cart);
      
      if (!orderResult?.orderId) {
        throw new Error('Failed to create order');
      }

      // Initialize payment
      const paymentData = await initializePayment(orderResult.orderId.toString(), cart.total);
      
      if (!paymentData) {
        throw new Error('Payment initialization failed');
      }

      // Redirect to PhonePe payment page
      if (paymentData.data?.paymentUrl) {
        window.location.href = paymentData.data.paymentUrl;
      } else {
        toast.error('Invalid payment URL');
        throw new Error('Invalid payment URL');
      }

    } catch (error) {
      console.error("Payment processing error:", error);
      toast.error("Failed to process payment. Please try again.");
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-semibold">Payment</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center mb-6">
            <div className="text-green-500 text-lg font-medium">
              Amount to Pay: ₹{cart.total}
            </div>
          </div>

          <button
            onClick={handlePayment}
            className="w-full bg-[#00bcd4] text-white py-3 rounded-lg hover:bg-[#00acc1] transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-lg">Proceed to Pay ₹{cart.total}</span>
          </button>

          <button
            onClick={() => router.back()}
            className="w-full mt-4 text-[#00bcd4] hover:text-[#00acc1] transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
