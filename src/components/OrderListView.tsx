'use client';

import React, { useState } from 'react';
import { ExternalLink, Truck, User, Mail, Calendar, Package, Edit3, Check, X, Phone, Link, CreditCard, Tag, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';
import { Order } from '@/types';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderListViewProps {
  orders: Order[];
  onUpdateTracking: (orderId: string, trackingData: Partial<Order>) => void;
}

export const OrderListView: React.FC<OrderListViewProps> = ({ orders, onUpdateTracking }) => {
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
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

  const toggleExpanded = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
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
    <>
      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-4">
        {orders.map((order, index) => (
          <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{order.orderNumber}</h3>
                  <p className="text-xs text-gray-500">QK: {order.qikinkOrderId}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <OrderStatusBadge status={order.status} />
                <button
                  onClick={() => toggleExpanded(order.id)}
                  className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                >
                  {expandedOrders.has(order.id) ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => editingOrder === order.id ? handleCancel(order.id) : handleEdit(order.id, order)}
                  className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex items-center space-x-2 text-sm">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">
                  {order.customerFirstName && order.customerLastName 
                    ? `${order.customerFirstName} ${order.customerLastName}`
                    : order.customerName
                  }
                </span>
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
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{formatDate(order.createdAt)}</span>
                </div>
                <span className="font-semibold text-gray-900">{formatCurrency(order.total)}</span>
              </div>
              {order.paymentGateway && (
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPaymentGatewayColor(order.paymentGateway)}`}>
                    {order.paymentGateway}
                  </span>
                </div>
              )}
            </div>

            {/* Expanded Details */}
            {expandedOrders.has(order.id) && (
              <div className="border-t pt-3 space-y-3">
                {/* Line Items */}
                {order.lineItems && order.lineItems.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <ShoppingBag className="w-4 h-4 text-gray-400" />
                      <h4 className="text-sm font-medium text-gray-900">Items ({order.lineItems.length})</h4>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 space-y-1 max-h-24 overflow-y-auto">
                      {order.lineItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-xs">
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
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {order.tags && order.tags.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <h4 className="text-sm font-medium text-gray-900">Tags</h4>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {order.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {editingOrder === order.id ? (
              <div className="border-t pt-3 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    placeholder="Enter tracking number"
                    value={trackingData[order.id]?.trackingNumber || ''}
                    onChange={(e) => setTrackingData(prev => ({
                      ...prev,
                      [order.id]: {
                        ...prev[order.id],
                        trackingNumber: e.target.value
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tracking URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="Enter tracking URL"
                    value={trackingData[order.id]?.trackingUrl || ''}
                    onChange={(e) => setTrackingData(prev => ({
                      ...prev,
                      [order.id]: {
                        ...prev[order.id],
                        trackingUrl: e.target.value
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleSave(order.id)}
                    className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => handleCancel(order.id)}
                    className="flex items-center space-x-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ) : order.trackingNumber ? (
              <div className="border-t pt-3">
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
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm transition-colors"
                      >
                        <span>Track</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="border-t pt-3">
                <p className="text-sm text-gray-500 italic">No tracking information available</p>
              </div>
            )}

            {order.lastSyncAt && (
              <div className="text-xs text-gray-400 mt-2 pt-2 border-t">
                Last synced: {formatDate(order.lastSyncAt)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Order Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Items & Tags
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[280px]">
                  Tracking
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mr-3 shadow-sm">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{order.orderNumber}</div>
                        <div className="text-xs text-gray-500">QK: {order.qikinkOrderId}</div>
                        <div className="flex items-center mt-1">
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">
                      {order.customerFirstName && order.customerLastName 
                        ? `${order.customerFirstName} ${order.customerLastName}`
                        : order.customerName
                      }
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
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

                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {/* Line Items */}
                      {order.lineItems && order.lineItems.length > 0 && (
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            {order.lineItems.length} item{order.lineItems.length > 1 ? 's' : ''}
                          </div>
                          <div className="space-y-1 max-h-16 overflow-y-auto">
                            {order.lineItems.slice(0, 2).map((item) => (
                              <div key={item.id} className="text-xs">
                                <div className="text-gray-900 font-medium truncate max-w-[200px]">
                                  {item.name}
                                </div>
                                <div className="text-gray-500">
                                  {item.quantity} × {formatCurrency(item.price)}
                                </div>
                              </div>
                            ))}
                            {order.lineItems.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{order.lineItems.length - 2} more items
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {order.tags && order.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {order.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                            >
                              {tag}
                            </span>
                          ))}
                          {order.tags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{order.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(order.total)}
                    </div>
                    {order.paymentGateway && (
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPaymentGatewayColor(order.paymentGateway)}`}>
                          {order.paymentGateway}
                        </span>
                      </div>
                    )}
                    {order.financialStatus && (
                      <div className="text-xs text-gray-500 mt-1 capitalize">
                        {order.financialStatus.replace('_', ' ')}
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 relative">
                    {editingOrder === order.id ? (
                      <div className="absolute top-2 left-6 right-6 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10 min-w-[260px]">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Tracking Number
                            </label>
                            <input
                              type="text"
                              placeholder="Enter tracking number"
                              value={trackingData[order.id]?.trackingNumber || ''}
                              onChange={(e) => setTrackingData(prev => ({
                                ...prev,
                                [order.id]: {
                                  ...prev[order.id],
                                  trackingNumber: e.target.value
                                }
                              }))}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Tracking URL (Optional)
                            </label>
                            <input
                              type="url"
                              placeholder="Enter tracking URL"
                              value={trackingData[order.id]?.trackingUrl || ''}
                              onChange={(e) => setTrackingData(prev => ({
                                ...prev,
                                [order.id]: {
                                  ...prev[order.id],
                                  trackingUrl: e.target.value
                                }
                              }))}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => handleSave(order.id)}
                              className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
                            >
                              <Check className="w-4 h-4" />
                              Save
                            </button>
                            <button
                              onClick={() => handleCancel(order.id)}
                              className="flex items-center gap-1 px-3 py-2 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700 transition-colors"
                            >
                              <X className="w-4 h-4" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : order.trackingNumber ? (
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-gray-900 mb-1">
                          <Truck className="w-3 h-3 text-gray-400" />
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            {order.trackingNumber}
                          </span>
                        </div>
                        {order.carrier && (
                          <div className="text-xs text-gray-500 mb-1">
                            via {order.carrier}
                          </div>
                        )}
                        {order.trackingUrl && (
                          <a
                            href={order.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                          >
                            <Link className="w-3 h-3" />
                            Track <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {order.lastSyncAt && (
                          <div className="text-xs text-gray-400 mt-1">
                            Synced: {formatDate(order.lastSyncAt)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500 italic">No tracking info</span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => editingOrder === order.id ? handleCancel(order.id) : handleEdit(order.id, order)}
                      className="text-blue-600 hover:text-blue-700 transition-colors p-2 hover:bg-blue-50 rounded-lg"
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
    </>
  );
};