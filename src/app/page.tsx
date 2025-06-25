'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { SearchAndFilter } from '@/components/SearchAndFilter';
import { StatsCards } from '@/components/StatsCards';
import { OrderCard } from '@/components/OrderCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { NotificationToast } from '@/components/NotificationToast';
import { SettingsModal } from '@/components/SettingsModal';
import { useOrders } from '@/hooks/useOrders';
import { useSettings } from '@/hooks/useSettings';

export default function Home() {
  const {
    orders,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    updateOrderTracking,
    syncAllOrders
  } = useOrders();

  const { config, saveConfig, isConfigured } = useSettings();
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const handleSyncAll = async () => {
    if (!isConfigured()) {
      setNotification({
        message: 'Please configure API settings first',
        type: 'error'
      });
      setIsSettingsOpen(true);
      return;
    }

    setIsSyncing(true);
    try {
      const result = await syncAllOrders();
      setNotification({
        message: result.message || 'All orders synced successfully',
        type: 'success'
      });
    } catch (error) {
      setNotification({
        message: 'Failed to sync orders',
        type: 'error'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateTracking = async (orderId: string, trackingData: any) => {
    try {
      await updateOrderTracking(orderId, trackingData);
      setNotification({
        message: 'Tracking information updated successfully',
        type: 'success'
      });
    } catch (error) {
      setNotification({
        message: 'Failed to update tracking information',
        type: 'error'
      });
    }
  };

  const handleSaveSettings = (newConfig: any) => {
    try {
      saveConfig(newConfig);
      setNotification({
        message: 'Settings saved successfully',
        type: 'success'
      });
    } catch (error) {
      setNotification({
        message: 'Failed to save settings',
        type: 'error'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header 
        onSync={handleSyncAll} 
        isSyncing={isSyncing}
        onSettingsClick={() => setIsSettingsOpen(true)}
        isConfigured={isConfigured()}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isConfigured() && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 mb-8 shadow-sm animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800 mb-1">Configuration Required</h3>
                  <p className="text-sm text-yellow-700 leading-relaxed">
                    Please configure your Shopify and Qikink API settings to start syncing orders and tracking information.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Configure Now
              </button>
            </div>
          </div>
        )}

        <div className="space-y-8">
          <SearchAndFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />

          <StatsCards orders={orders} />

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <LoadingSpinner />
            </div>
          ) : orders.length === 0 ? (
            <div className="animate-fade-in">
              <EmptyState />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
              {orders.map((order, index) => (
                <div 
                  key={order.id} 
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <OrderCard
                    order={order}
                    onUpdateTracking={handleUpdateTracking}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        currentConfig={config}
      />

      {notification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}