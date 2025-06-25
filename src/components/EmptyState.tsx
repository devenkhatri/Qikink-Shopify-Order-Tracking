'use client';

import React from 'react';
import { Package } from 'lucide-react';

export const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4">
        <Package className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
      <p className="text-gray-600 max-w-md mx-auto">
        No orders match your search criteria. Try adjusting your filters or search terms.
      </p>
    </div>
  );
};