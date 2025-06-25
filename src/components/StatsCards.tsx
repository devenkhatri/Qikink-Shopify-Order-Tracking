'use client';

import React from 'react';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { Order } from '@/types';

interface StatsCardsProps {
  orders: Order[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ orders }) => {
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length
  };

  const cards = [
    {
      title: 'Total Orders',
      value: stats.total,
      icon: Package,
      color: 'blue'
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'yellow'
    },
    {
      title: 'Shipped',
      value: stats.shipped,
      icon: Truck,
      color: 'purple'
    },
    {
      title: 'Delivered',
      value: stats.delivered,
      icon: CheckCircle,
      color: 'green'
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-500 text-white';
      case 'yellow':
        return 'bg-yellow-500 text-white';
      case 'purple':
        return 'bg-purple-500 text-white';
      case 'green':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{card.title}</p>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            </div>
            <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${getColorClasses(card.color)}`}>
              <card.icon className="w-6 h-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};