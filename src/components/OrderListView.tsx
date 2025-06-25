'use client';

import React, { useState } from 'react';
import { ExternalLink, Truck, User, Mail, Calendar, Package, Edit3, Check, X, Phone, Link } from 'lucide-react';
import { Order } from '@/types';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderListViewProps {
  orders: Order[];
  onUpdateTracking: (orderId: string, trackingData: Partial<Order>) => void;
}

export const OrderListView: React.FC<OrderListViewProps> = ({ orders, onUpdateTracking }) => {
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<{[key: string]: {trackingNumber: string, trackingUrl: string}}>({});

  const handleEdit = (orderId: string, order: Order) => {
    setEditingOrder(orderId);
    setTrackingData(prev => ({
      ...prev,
      [orderId]: {
        trackingNumber: order.trackingNumber || '',
        trackingUrl: order.trackingUrl || ''
      }
    }));
  };

  const handleSave = (orderId: string) => {
    const data = trackingData[orderId];
    if (data) {
      onUpdateTracking(orderId, {
        trackingNumber: data.trackingNumber,
        trackingUrl: data.trackingUrl,
        status: data.trackingNumber ? 'shipped' : orders.find(o => o.id === orderId)?.status
      });
    }
    setEditingOrder(null);
  };

  const handleCancel = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setTrackingData(prev => ({
        ...prev,
        [orderId]: {
          trackingNumber: order.trackingNumber || '',
          trackingUrl: order.trackingUrl || ''
        }
      }));
    }
    setEditingOrder(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tracking
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order, index) => (
              <tr 
                key={order.id} 
                className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mr-3">
                      <Package className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                      <div className="text-xs text-gray-500">QK: {order.qikinkOrderId}</div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{order.customerName}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {order.customerEmail}
                  </div>
                  {order.customerPhone && (
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Phone className="w-3 h-3" />
                      {order.customerPhone}
                    </div>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <OrderStatusBadge status={order.status} />
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(order.total)}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingOrder === order.id ? (
                    <div className="space-y-2 min-w-[200px]">
                      <input
                        type="text"
                        placeholder="Tracking number"
                        value={trackingData[order.id]?.trackingNumber || ''}
                        onChange={(e) => setTrackingData(prev => ({
                          ...prev,
                          [order.id]: {
                            ...prev[order.id],
                            trackingNumber: e.target.value
                          }
                        }))}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="url"
                        placeholder="Tracking URL (optional)"
                        value={trackingData[order.id]?.trackingUrl || ''}
                        onChange={(e) => setTrackingData(prev => ({
                          ...prev,
                          [order.id]: {
                            ...prev[order.id],
                            trackingUrl: e.target.value
                          }
                        }))}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleSave(order.id)}
                          className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                        >
                          <Check className="w-3 h-3" />
                          Save
                        </button>
                        <button
                          onClick={() => handleCancel(order.id)}
                          className="flex items-center gap-1 px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors"
                        >
                          <X className="w-3 h-3" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : order.trackingNumber ? (
                    <div className="text-sm">
                      <div className="flex items-center gap-1 text-gray-900">
                        <Truck className="w-3 h-3 text-gray-400" />
                        <span className="font-mono text-xs">{order.trackingNumber}</span>
                      </div>
                      {order.trackingUrl && (
                        <a
                          href={order.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-1"
                        >
                          <Link className="w-3 h-3" />
                          Track <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500 italic">No tracking info</span>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(order.createdAt)}
                  </div>
                  {order.lastSyncAt && (
                    <div className="text-xs text-gray-400 mt-1">
                      Synced: {formatDate(order.lastSyncAt)}
                    </div>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => editingOrder === order.id ? handleCancel(order.id) : handleEdit(order.id, order)}
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                    title="Edit tracking"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};