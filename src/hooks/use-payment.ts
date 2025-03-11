"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function usePayment() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const initializePayment = async (orderId: string, amount: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Authentication required");
        router.push('/login');
        return null;
      }

      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('phonepe-pay', {
        body: {
          amount: amount,
          orderId: orderId,
          callbackUrl: typeof window !== 'undefined' 
            ? `${window.location.origin}/checkout/callback`
            : 'http://localhost:3000/checkout/callback'
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (paymentError) {
        console.error('Payment error:', paymentError);
        toast.error(paymentError.message || 'Payment initialization failed');
        return null;
      }

      if (!paymentData?.success) {
        console.error('Payment data error:', paymentData);
        toast.error('Payment initialization failed');
        return null;
      }

      return paymentData;
    } catch (error) {
      console.error('Payment initialization error:', error);
      toast.error('Failed to initialize payment');
      return null;
    }
  };

  return {
    loading,
    initializePayment
  };
}
