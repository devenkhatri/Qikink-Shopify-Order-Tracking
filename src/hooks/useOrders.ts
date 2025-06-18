import { useState, useEffect } from 'react';
import { Order } from '../types';

// Mock data for demonstration - in production, this would fetch from Shopify API
const mockOrders: Order[] = [
  {
    id: '1001',
    orderNumber: '#1001',
    customerName: 'Rajesh Kumar',
    customerEmail: 'rajesh@example.com',
    createdAt: '2024-01-15T10:30:00Z',
    status: 'processing',
    total: 2499.99,
    qikinkOrderId: 'QK-2024-001'
  },
  {
    id: '1002',
    orderNumber: '#1002',
    customerName: 'Priya Sharma',
    customerEmail: 'priya@example.com',
    createdAt: '2024-01-14T14:22:00Z',
    status: 'shipped',
    total: 3599.50,
    trackingNumber: 'BD123456789',
    carrier: 'BlueDart',
    trackingUrl: 'https://bluedart.com/track/BD123456789',
    qikinkOrderId: 'QK-2024-002',
    lastSyncAt: '2024-01-16T09:15:00Z'
  },
  {
    id: '1003',
    orderNumber: '#1003',
    customerName: 'Amit Patel',
    customerEmail: 'amit@example.com',
    createdAt: '2024-01-13T16:45:00Z',
    status: 'delivered',
    total: 1899.25,
    trackingNumber: 'DTDC987654321',
    carrier: 'DTDC',
    trackingUrl: 'https://dtdc.com/track/DTDC987654321',
    qikinkOrderId: 'QK-2024-003',
    lastSyncAt: '2024-01-17T11:30:00Z'
  },
  {
    id: '1004',
    orderNumber: '#1004',
    customerName: 'Sneha Gupta',
    customerEmail: 'sneha@example.com',
    createdAt: '2024-01-16T08:12:00Z',
    status: 'pending',
    total: 4999.99,
    qikinkOrderId: 'QK-2024-004'
  },
  {
    id: '1005',
    orderNumber: '#1005',
    customerName: 'Vikram Singh',
    customerEmail: 'vikram@example.com',
    createdAt: '2024-01-17T12:30:00Z',
    status: 'processing',
    total: 1299.00,
    qikinkOrderId: 'QK-2024-005'
  },
  {
    id: '1006',
    orderNumber: '#1006',
    customerName: 'Kavya Reddy',
    customerEmail: 'kavya@example.com',
    createdAt: '2024-01-18T15:45:00Z',
    status: 'shipped',
    total: 2799.75,
    trackingNumber: 'DEL456789123',
    carrier: 'Delhivery',
    trackingUrl: 'https://delhivery.com/track/DEL456789123',
    qikinkOrderId: 'QK-2024-006',
    lastSyncAt: '2024-01-19T10:20:00Z'
  }
];

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    // Simulate API call
    const fetchOrders = async () => {
      setLoading(true);
      // In production, this would be an actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOrders(mockOrders);
      setLoading(false);
    };

    fetchOrders();
  }, []);

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
    setOrders(prev => 
      prev.map(order => 
        order.id === orderId 
          ? { ...order, ...trackingData, lastSyncAt: new Date().toISOString() }
          : order
      )
    );
  };

  return {
    orders: filteredOrders,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    updateOrderTracking
  };
};