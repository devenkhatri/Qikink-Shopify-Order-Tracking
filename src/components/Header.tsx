import React from 'react';
import { Package, Settings, RefreshCw, AlertCircle } from 'lucide-react';

interface HeaderProps {
  onSync: () => void;
  isSyncing: boolean;
  onSettingsClick: () => void;
  isConfigured: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  onSync, 
  isSyncing, 
  onSettingsClick, 
  isConfigured 
}) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Qikink Order Tracking</h1>
            <p className="text-sm text-gray-600">Manage and sync order tracking information</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync All'}</span>
          </button>
          
          <button 
            onClick={onSettingsClick}
            className={`relative flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
              isConfigured 
                ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' 
                : 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
            }`}
          >
            <Settings className="w-5 h-5" />
            {!isConfigured && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center">
                <AlertCircle className="w-2 h-2 text-white" />
              </div>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};