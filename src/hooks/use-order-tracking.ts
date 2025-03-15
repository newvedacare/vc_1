"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { format } from "date-fns";

export interface OrderStatus {
  order_id: number;
  current_status: string;
  current_location?: string;
  estimated_delivery_date?: string;
  updated_at: string;
  events?: Array<{
    event_type: string;
    event_data: any;
    created_at: string;
  }>;
}

export function useOrderTracking(orderId?: string | number) {
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    // Initial fetch of order status
    const fetchOrderStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            order_id,
            current_status,
            current_location,
            estimated_delivery_date,
            updated_at,
            events
          `)
          .eq('order_id', parseInt(orderId as string))
          .single();

        if (error) throw error;
        setOrderStatus(data as OrderStatus);
      } catch (error) {
        console.error('Error fetching order status:', error);
        toast.error('Failed to fetch order status');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderStatus();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `order_id=eq.${orderId}`
        },
        (payload) => {
          setOrderStatus(payload.new as OrderStatus);
          toast.success('Order status updated!');
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [orderId]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'PPp');
  };

  return {
    orderStatus,
    loading,
    getStatusColor,
    formatDate
  };
}
