"use client";

import { useOrderTracking } from "@/hooks/use-order-tracking";
import { Truck, Package, CheckCircle, Clock, XCircle } from "lucide-react";

interface OrderTrackingProps {
  orderId: string | number;
}

export function OrderTracking({ orderId }: OrderTrackingProps) {
  const { orderStatus, loading, getStatusColor, formatDate } = useOrderTracking(orderId);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!orderStatus) {
    return (
      <div className="text-center p-8 text-gray-500">
        No tracking information available
      </div>
    );
  }

  const statusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="w-6 h-6" />;
      case 'processing':
        return <Package className="w-6 h-6" />;
      case 'shipped':
        return <Truck className="w-6 h-6" />;
      case 'delivered':
        return <CheckCircle className="w-6 h-6" />;
      case 'cancelled':
        return <XCircle className="w-6 h-6" />;
      default:
        return <Clock className="w-6 h-6" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Order Status</h2>
        <span 
          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(orderStatus.current_status)}`}
        >
          {orderStatus.current_status}
        </span>
      </div>

      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            {statusIcon(orderStatus.current_status)}
          </div>
          <div>
            <div className="font-medium">Current Status</div>
            <div className="text-gray-600 text-sm mt-1">
              {orderStatus.current_location ? (
                <>Your order is at {orderStatus.current_location}</>
              ) : (
                <>Status updated to {orderStatus.current_status}</>
              )}
            </div>
            <div className="text-gray-400 text-xs mt-1">
              {formatDate(orderStatus.updated_at)}
            </div>
          </div>
        </div>

        {orderStatus.estimated_delivery_date && (
          <div className="border-t pt-4">
            <div className="text-sm text-gray-600">
              Estimated Delivery Date
            </div>
            <div className="font-medium mt-1">
              {formatDate(orderStatus.estimated_delivery_date)}
            </div>
          </div>
        )}

        {orderStatus.events && orderStatus.events.length > 0 && (
          <div className="border-t pt-4">
            <div className="text-sm font-medium mb-3">Order Timeline</div>
            <div className="space-y-4">
              {orderStatus.events.map((event, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {statusIcon(event.event_type)}
                  </div>
                  <div>
                    <div className="font-medium">{event.event_type}</div>
                    <div className="text-gray-600 text-sm mt-1">
                      {event.event_data.notes || 'Status updated'}
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      {formatDate(event.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
