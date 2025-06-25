'use client';

import React from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';

interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange
}) => {
  const statusOptions = [
    { value: 'all', label: 'All Orders', count: null },
    { value: 'pending', label: 'Pending', count: null },
    { value: 'processing', label: 'Processing', count: null },
    { value: 'shipped', label: 'Shipped', count: null },
    { value: 'delivered', label: 'Delivered', count: null },
    { value: 'cancelled', label: 'Cancelled', count: null }
  ];

  return (
    <div className="card p-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search orders, customers, or tracking numbers..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-field pl-11 pr-4 py-3 text-sm placeholder-gray-500 focus:placeholder-gray-400"
          />
        </div>
        
        <div className="lg:w-56 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SlidersHorizontal className="h-5 w-5 text-gray-400" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="input-field pl-11 pr-8 py-3 text-sm appearance-none bg-white cursor-pointer"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};