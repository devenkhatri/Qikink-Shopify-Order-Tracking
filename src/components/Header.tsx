'use client';

import React from 'react';
import { Package, Settings, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

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
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Qikink Order Tracking
              </h1>
              <p className="text-sm text-gray-600 font-medium">
                Manage and sync order tracking information
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onSync}
              disabled={isSyncing}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm
                ${isSyncing 
                  ? 'bg-blue-100 text-blue-600 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                }
              `}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync All'}</span>
            </button>
            
            <button 
              onClick={onSettingsClick}
              className={`
                relative flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 shadow-sm
                ${isConfigured 
                  ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2' 
                  : 'text-orange-600 hover:text-orange-700 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2'
                }
              `}
            >
              <Settings className="w-5 h-5" />
              {!isConfigured && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
                  <AlertCircle className="w-2 h-2 text-white" />
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};