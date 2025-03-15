"use client";

import { Suspense, useEffect, useState } from "react";
import { OrderTracking } from "@/components/order-tracking";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function PaymentCallbackPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'success' | 'failure' | 'pending'>('pending');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const code = searchParams?.get('code');
        const merchantTransactionId = searchParams?.get('transactionId');

        if (!code || !merchantTransactionId) {
          throw new Error('Invalid payment response');
        }

        // Get session for auth
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Authentication required");
          router.push('/login');
          return;
        }

        // Verify payment status
        const { data: verificationData, error: verificationError } = await supabase.functions.invoke('phonepe-verify', {
          body: {
            code,
            merchantTransactionId
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });

        if (verificationError || !verificationData?.success) {
          throw new Error(verificationError?.message || 'Payment verification failed');
        }

        setStatus(verificationData.data.status === 'PAYMENT_SUCCESS' ? 'success' : 'failure');
        
        if (verificationData.data.status === 'PAYMENT_SUCCESS') {
          toast.success("Payment successful!");
          // Clear cart after successful payment
          localStorage.removeItem('mukorossi_cart');
        } else {
          toast.error("Payment failed. Please try again.");
        }

      } catch (error) {
        console.error('Payment verification error:', error);
        toast.error("Failed to verify payment");
        setStatus('failure');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [router, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.push('/')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-semibold">Payment {status === 'success' ? 'Successful' : 'Failed'}</h1>
        </div>

        {status === 'success' && searchParams?.get('orderId') && (
          <div className="mb-8">
            <OrderTracking orderId={searchParams.get('orderId')!} />
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          {status === 'success' ? (
            <>
              <div className="text-green-500 text-6xl mb-4">✓</div>
              <h2 className="text-2xl font-medium mb-2">Thank you for your purchase!</h2>
              <p className="text-gray-600 mb-6">Your payment has been processed successfully.</p>
              <button
                onClick={() => router.push('/orders')}
                className="bg-[#800000] text-white px-6 py-2 rounded hover:bg-[#600000] transition-colors"
              >
                View Orders
              </button>
            </>
          ) : (
            <>
              <div className="text-red-500 text-6xl mb-4">×</div>
              <h2 className="text-2xl font-medium mb-2">Payment Failed</h2>
              <p className="text-gray-600 mb-6">We couldn't process your payment. Please try again.</p>
              <button
                onClick={() => router.push('/cart')}
                className="bg-[#800000] text-white px-6 py-2 rounded hover:bg-[#600000] transition-colors"
              >
                Return to Cart
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
