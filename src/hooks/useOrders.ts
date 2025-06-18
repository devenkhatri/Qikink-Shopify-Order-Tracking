import { useState, useEffect, useCallback } from 'react';
import { Order } from '../types';
import { shopifyApi } from '../services/api';
import { useSettings } from './useSettings';

export const useOrders = () => {
  const { config } = useSettings();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedOrders = await shopifyApi.fetchOrders(config);
      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [config]);

  useEffect(() => {
    if (config.shopifyDomain && config.shopifyAccessToken) {
      fetchOrders();
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [config.shopifyDomain, config.shopifyAccessToken, fetchOrders]);

  const refreshOrders = async () => {
    if (!config.shopifyDomain || !config.shopifyAccessToken) {
      return;
    }
    
    setRefreshing(true);
    try {
      await fetchOrders();
    } finally {
      setRefreshing(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.trackingNumber && order.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const updateOrderTracking = async (orderId: string, trackingData: Partial<Order>) => {
    try {
      await shopifyApi.updateOrderTracking(config, orderId, {
        orderId,
        trackingNumber: trackingData.trackingNumber || '',
        carrier: trackingData.carrier || '',
        status: trackingData.status || 'shipped',
        trackingUrl: trackingData.trackingUrl,
      });

      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, ...trackingData, lastSyncAt: new Date().toISOString() }
            : order
        )
      );
    } catch (error) {
      console.error('Failed to update order tracking:', error);
      throw error;
    }
  };

  return {
    orders: filteredOrders,
    loading,
    refreshing,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    updateOrderTracking,
    refreshOrders
  };
};