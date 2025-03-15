"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function usePayment() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const initializePayment = async (orderId: string, amount: number) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Authentication required");
        router.push('/login');
        return null;
      }

      // Get Razorpay order ID from edge function
      const { data: razorpayData, error: razorpayError } = await supabase.functions.invoke('razorpay-create-order', {
        body: {
          amount: amount * 100, // Convert to paise
          orderId: orderId,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (razorpayError || !razorpayData?.success) {
        console.error('Razorpay order creation error:', razorpayError || razorpayData);
        toast.error('Failed to initialize payment');
        return null;
      }

      // Load Razorpay SDK
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.body.appendChild(script);

      return new Promise((resolve) => {
        script.onload = () => {
          const options = {
            key: razorpayData.key_id,
            amount: amount * 100,
            currency: "INR",
            name: "Mukorossi",
            description: "Order Payment",
            order_id: razorpayData.order_id,
            handler: async function (response: any) {
              try {
                // Verify payment
                const { data: verifyData, error: verifyError } = await supabase.functions.invoke('razorpay-verify', {
                  body: {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    orderId: orderId
                  },
                  headers: {
                    Authorization: `Bearer ${session.access_token}`
                  }
                });

                if (verifyError || !verifyData?.success) {
                  throw new Error('Payment verification failed');
                }

                toast.success('Payment successful!');
                router.push('/checkout/callback?status=success');
              } catch (error) {
                console.error('Payment verification error:', error);
                toast.error('Payment verification failed');
                router.push('/checkout/callback?status=failure');
              }
            },
            prefill: {
              email: session.user.email
            },
            theme: {
              color: "#00bcd4"
            }
          };

          const razorpayInstance = new window.Razorpay(options);
          razorpayInstance.open();
          resolve(razorpayData);
        };
      });
    } catch (error) {
      console.error('Payment initialization error:', error);
      toast.error('Failed to initialize payment');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    initializePayment
  };
}
