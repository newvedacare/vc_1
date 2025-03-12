// @ts-nocheck
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { crypto } from "https://deno.land/std@0.208.0/crypto/mod.ts";

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
if (!MERCHANT_ID) throw new Error('PHONEPE_MERCHANT_ID is not set');

const SALT_KEY = Deno.env.get('PHONEPE_SALT_KEY');
if (!SALT_KEY) throw new Error('PHONEPE_SALT_KEY is not set');

const SALT_INDEX = Deno.env.get('PHONEPE_SALT_INDEX') || '1';

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
    if (!authHeader) {
      throw new Error('No authorization header');
    }
    const token = authHeader.replace('Bearer ', '');
    
    // Get user ID from JWT
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Failed to get user information');
    }

    const { merchantTransactionId } = await req.json();

    // Get transaction details
    const { data: transaction, error: txError } = await supabaseClient
      .from('payment_transactions')
      .select('*')
      .eq('merchant_transaction_id', merchantTransactionId)
      .eq('user_id', user.id)
      .single();

    if (txError || !transaction) {
      throw new Error('Transaction not found');
    }

    // Generate checksum
    const stringToHash = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + SALT_KEY;
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(stringToHash)
    );
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const checksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('') + "###" + SALT_INDEX;

    // Check payment status
    const response = await fetch(
      `https://api.phonepe.com/apis/hermes/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
          'X-MERCHANT-ID': MERCHANT_ID
        }
      }
    );

    const statusResponse = await response.json();

    // Update transaction status
    await supabaseClient
      .from('payment_transactions')
      .update({
        status: statusResponse.code === 'PAYMENT_SUCCESS' ? 'completed' : 'failed',
        payment_state: statusResponse.code,
        payment_instrument_details: statusResponse.data?.paymentInstrument || null,
        error_details: statusResponse.code !== 'PAYMENT_SUCCESS' ? statusResponse : null,
        last_verified_at: new Date().toISOString(),
        verification_attempts: transaction.verification_attempts + 1
      })
      .eq('merchant_transaction_id', merchantTransactionId);

    // Update order status
    if (statusResponse.code === 'PAYMENT_SUCCESS') {
      await supabaseClient
        .from('orders')
        .update({
          payment_status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('transaction_id', merchantTransactionId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: statusResponse
      }),
      { 
        headers: {
          ...getCorsHeaders(req),
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Payment verification error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
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
