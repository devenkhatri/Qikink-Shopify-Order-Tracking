'use client';

import React, { useState } from 'react';
import { ExternalLink, Truck, User, Mail, Calendar, Package, Edit3, Check, X, Phone, Link, CreditCard, Tag, ShoppingBag } from 'lucide-react';
import { Order } from '@/types';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderCardProps {
  order: Order;
  onUpdateTracking: (orderId: string, trackingData: Partial<Order>) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onUpdateTracking }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');
  const [trackingUrl, setTrackingUrl] = useState(order.trackingUrl || '');

  const handleSave = () => {
    onUpdateTracking(order.id, {
      trackingNumber,
      trackingUrl,
      status: trackingNumber ? 'shipped' : order.status
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTrackingNumber(order.trackingNumber || '');
    setTrackingUrl(order.trackingUrl || '');
    setIsEditing(false);
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

  const getPaymentGatewayColor = (gateway?: string) => {
    switch (gateway?.toLowerCase()) {
      case 'razorpay':
        return 'bg-blue-100 text-blue-800';
      case 'paypal':
        return 'bg-yellow-100 text-yellow-800';
      case 'stripe':
        return 'bg-purple-100 text-purple-800';
      case 'upi':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{order.orderNumber}</h3>
            <p className="text-sm text-gray-500">Qikink ID: {order.qikinkOrderId}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <OrderStatusBadge status={order.status} />
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Customer Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm">
            <User className="w-4 h-4 text-gray-400" />
            <div>
              <span className="text-gray-900 font-medium">
                {order.customerFirstName && order.customerLastName 
                  ? `${order.customerFirstName} ${order.customerLastName}`
                  : order.customerName
                }
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600 truncate">{order.customerEmail}</span>
          </div>
          {order.customerPhone && (
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{order.customerPhone}</span>
            </div>
          )}
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{formatDate(order.createdAt)}</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="text-sm">
            <span className="text-gray-600">Total: </span>
            <span className="font-semibold text-gray-900 text-lg">{formatCurrency(order.total)}</span>
          </div>
          {order.paymentGateway && (
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentGatewayColor(order.paymentGateway)}`}>
                {order.paymentGateway}
              </span>
            </div>
          )}
          {order.lastSyncAt && (
            <div className="text-xs text-gray-500">
              Last synced: {formatDate(order.lastSyncAt)}
            </div>
          )}
        </div>
      </div>

      {/* Line Items */}
      {order.lineItems && order.lineItems.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-3">
            <ShoppingBag className="w-4 h-4 text-gray-400" />
            <h4 className="text-sm font-medium text-gray-900">Items ({order.lineItems.length})</h4>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 space-y-2 max-h-32 overflow-y-auto">
            {order.lineItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-medium truncate">{item.name}</p>
                  {item.variant_title && (
                    <p className="text-gray-500 text-xs">{item.variant_title}</p>
                  )}
                </div>
                <div className="text-right ml-2">
                  <p className="text-gray-900">
                    {item.quantity} × {formatCurrency(item.price)}
                  </p>
                  <p className="text-gray-500 text-xs font-medium">
                    {formatCurrency(item.quantity * item.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {order.tags && order.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Tag className="w-4 h-4 text-gray-400" />
            <h4 className="text-sm font-medium text-gray-900">Tags</h4>
          </div>
          <div className="flex flex-wrap gap-1">
            {order.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tracking Section */}
      {isEditing ? (
        <div className="border-t pt-4 space-y-3">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tracking Number
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tracking URL
              </label>
              <input
                type="url"
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                placeholder="Enter tracking URL (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center space-x-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm transition-colors shadow-sm"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ) : order.trackingNumber ? (
        <div className="border-t pt-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                {order.trackingNumber}
              </span>
              {order.carrier && (
                <span className="text-xs text-gray-500">via {order.carrier}</span>
              )}
            </div>
            {order.trackingUrl && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Link className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Tracking available</span>
                </div>
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm transition-colors font-medium"
                >
                  <span>Track Package</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="border-t pt-4">
          <p className="text-sm text-gray-500 italic">No tracking information available</p>
        </div>
      )}
    </div>
  );
};