'use client';

import { useState, useEffect } from 'react';
import { Order } from '@/types';
import { useSettings } from './useSettings';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { config } = useSettings();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add API credentials to headers if configured
      if (config.shopifyDomain) {
        headers['x-shopify-domain'] = config.shopifyDomain;
      }
      if (config.shopifyAccessToken) {
        headers['x-shopify-token'] = config.shopifyAccessToken;
      }

      const response = await fetch(`/api/orders?${params.toString()}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const result = await response.json();
      if (result.success) {
        setOrders(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Keep existing orders on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [searchTerm, statusFilter, config.shopifyDomain, config.shopifyAccessToken]);

  const updateOrderTracking = async (orderId: string, trackingData: Partial<Order>) => {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add API credentials to headers
      if (config.shopifyDomain) {
        headers['x-shopify-domain'] = config.shopifyDomain;
      }
      if (config.shopifyAccessToken) {
        headers['x-shopify-token'] = config.shopifyAccessToken;
      }
      if (config.qikinkClientId) {
        headers['x-qikink-client-id'] = config.qikinkClientId;
      }
      if (config.qikinkAccessToken) {
        headers['x-qikink-access-token'] = config.qikinkAccessToken;
      }
      if (config.qikinkApiUrl) {
        headers['x-qikink-api-url'] = config.qikinkApiUrl;
      }

      // Find the order to get Qikink order ID
      const order = orders.find(o => o.id === orderId);
      if (order?.qikinkOrderId) {
        headers['x-qikink-order-id'] = order.qikinkOrderId;
      }

      const response = await fetch(`/api/orders/${orderId}/tracking`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          trackingNumber: trackingData.trackingNumber,
          carrier: trackingData.carrier,
          status: trackingData.status
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update tracking information');
      }

      const result = await response.json();
      if (result.success) {
        // Update local state
        setOrders(prev => 
          prev.map(order => 
            order.id === orderId 
              ? { 
                  ...order, 
                  ...trackingData, 
                  trackingUrl: trackingData.trackingNumber 
                    ? `https://${trackingData.carrier?.toLowerCase()}.com/track/${trackingData.trackingNumber}` 
                    : undefined,
                  lastSyncAt: new Date().toISOString() 
                }
              : order
          )
        );
      } else {
        throw new Error(result.error || 'Failed to update tracking information');
      }
    } catch (error) {
      console.error('Error updating tracking:', error);
      throw error;
    }
  };

  const syncAllOrders = async () => {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add API credentials to headers
      if (config.shopifyDomain) {
        headers['x-shopify-domain'] = config.shopifyDomain;
      }
      if (config.shopifyAccessToken) {
        headers['x-shopify-token'] = config.shopifyAccessToken;
      }
      if (config.qikinkClientId) {
        headers['x-qikink-client-id'] = config.qikinkClientId;
      }
      if (config.qikinkAccessToken) {
        headers['x-qikink-access-token'] = config.qikinkAccessToken;
      }
      if (config.qikinkApiUrl) {
        headers['x-qikink-api-url'] = config.qikinkApiUrl;
      }

      const response = await fetch('/api/sync', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          orderIds: orders.map(order => order.id)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to sync orders');
      }

      const result = await response.json();
      if (result.success) {
        // Refresh orders after sync
        await fetchOrders();
        return result;
      } else {
        throw new Error(result.error || 'Failed to sync orders');
      }
    } catch (error) {
      console.error('Error syncing orders:', error);
      throw error;
    }
  };

  return {
    orders,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    updateOrderTracking,
    syncAllOrders,
    refetch: fetchOrders
  };
};