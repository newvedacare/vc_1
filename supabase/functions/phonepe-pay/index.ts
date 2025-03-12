// @ts-nocheck
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { encode as base64Encode } from "jsr:@std/encoding/base64";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': '*',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true'
};

// Function to check if origin is from vedahaircare.in domain
const isVedaHaircareDomain = (origin: string | null): boolean => {
  if (!origin) return false;
  return origin.endsWith('vedahaircare.in') || origin === 'https://vedahaircare.in';
};

// Function to handle CORS headers based on origin
const getCorsHeaders = (req: Request) => {
  const origin = req.headers.get('origin');
  return {
    ...corsHeaders,
    'Access-Control-Allow-Origin': isVedaHaircareDomain(origin) ? origin : '*'
  };
};

const MERCHANT_ID = Deno.env.get('PHONEPE_MERCHANT_ID');
const SALT_KEY = Deno.env.get('PHONEPE_SALT_KEY');
const SALT_INDEX = Deno.env.get('PHONEPE_SALT_INDEX');

if (!MERCHANT_ID || !SALT_KEY || !SALT_INDEX) {
  throw new Error('Missing required environment variables');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: getCorsHeaders(req)
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user ID from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) throw new Error('No authorization header');
    const token = authHeader.replace('Bearer ', '');

    // Get user ID from JWT
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) throw new Error('Failed to get user information');

    const { amount, orderId, callbackUrl } = await req.json();
    if (!amount || !orderId || !callbackUrl) {
      throw new Error('Missing required parameters');
    }

    // Generate merchant transaction ID
    const merchantTransactionId = `MT${Date.now()}${Math.floor(Math.random() * 1000000)}`;

    // Create PhonePe payload according to specification
    const payload = {
      merchantOrderId: `TX${Date.now()}`,
      amount: amount,
      expireAfter: 1200, // 20 minutes expiry
      metaInfo: {
        udf1: "additional-information-1",
        udf2: "additional-information-2",
        udf3: "additional-information-3",
        udf4: "additional-information-4",
        udf5: "additional-information-5"
      },
      paymentFlow: {
        type: "PG_CHECKOUT",
        message: "Payment message used for collect requests",
        merchantUrls: {
          redirectUrl: callbackUrl
        }
      }
    };

    // Convert payload to base64
    const base64Payload = base64Encode(JSON.stringify(payload));

    // Generate X-VERIFY hash
    const string = base64Payload + "/pg/v1/pay" + SALT_KEY;
    const xVerify = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(string)
    );
    const xVerifyHash = Array.from(new Uint8Array(xVerify))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('') + "###" + SALT_INDEX;

    // Create payment transaction record
    const { error: dbError } = await supabaseClient
      .from('payment_transactions')
      .insert({
        merchant_transaction_id: merchantTransactionId,
        merchant_id: MERCHANT_ID,
        merchant_user_id: `MUID${user.id}`,
        amount: amount,
        status: 'initiated',
        user_id: user.id,
        phonepe_payload: payload
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to create payment transaction');
    }

    // Update order with transaction ID
    const { error: orderError } = await supabaseClient
      .from('orders')
      .update({ 
        transaction_id: merchantTransactionId,
        payment_status: 'pending',
        order_status: 'processing',
        payment_method: 'phonepe'
      })
      .eq('order_id', orderId);

    if (orderError) {
      console.error('Order update error:', orderError);
      throw new Error('Failed to update order');
    }

    // Make request to PhonePe API
    const response = await fetch('https://api.phonepe.com/apis/hermes/pg/v1/pay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerifyHash
      },
      body: JSON.stringify({
        request: base64Payload
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('PhonePe API error:', errorData);
      throw new Error('Failed to initialize payment');
    }

    const paymentData = await response.json();
    
    // Update transaction with PhonePe response
    await supabaseClient
      .from('payment_transactions')
      .update({ 
        phonepe_response: paymentData,
        payment_state: 'pending'
      })
      .eq('merchant_transaction_id', merchantTransactionId);

    if (!paymentData.data?.instrumentResponse?.redirectInfo?.url) {
      throw new Error('Invalid payment URL received from PhonePe');
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          paymentUrl: paymentData.data.instrumentResponse.redirectInfo.url,
          merchantTransactionId
        }
      }),
      {
        headers: {
          ...getCorsHeaders(req),
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Payment error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    );
  }
});
