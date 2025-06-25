'use client';

import React from 'react';
import { Grid3X3, List, LayoutGrid } from 'lucide-react';
import { ViewMode } from '@/types';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, onViewModeChange }) => {
  return (
    <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
      <button
        onClick={() => onViewModeChange('grid')}
        className={`
          flex items-center justify-center w-10 h-10 rounded-md transition-all duration-200
          ${viewMode === 'grid' 
            ? 'bg-blue-100 text-blue-600 shadow-sm' 
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }
        `}
        title="Grid View"
      >
        <LayoutGrid className="w-5 h-5" />
      </button>
      <button
        onClick={() => onViewModeChange('list')}
        className={`
          flex items-center justify-center w-10 h-10 rounded-md transition-all duration-200
          ${viewMode === 'list' 
            ? 'bg-blue-100 text-blue-600 shadow-sm' 
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }
        `}
        title="List View"
      >
        <List className="w-5 h-5" />
      </button>
    </div>
  );
};