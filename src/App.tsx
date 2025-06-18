import React, { useState } from 'react';
import { Header } from './components/Header';
import { SearchAndFilter } from './components/SearchAndFilter';
import { StatsCards } from './components/StatsCards';
import { OrderCard } from './components/OrderCard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { EmptyState } from './components/EmptyState';
import { NotificationToast } from './components/NotificationToast';
import { SettingsModal } from './components/SettingsModal';
import { useOrders } from './hooks/useOrders';
import { useQikinkApi } from './hooks/useQikinkApi';
import { useSettings } from './hooks/useSettings';

function App() {
  const {
    orders,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    updateOrderTracking
  } = useOrders();

  const { syncOrderStatus } = useQikinkApi();
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
      // Simulate syncing all orders
      await new Promise(resolve => setTimeout(resolve, 3000));
      setNotification({
        message: 'All orders synced successfully',
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
    <div className="min-h-screen bg-gray-50">
      <Header 
        onSync={handleSyncAll} 
        isSyncing={isSyncing}
        onSettingsClick={() => setIsSettingsOpen(true)}
        isConfigured={isConfigured()}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isConfigured() && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Configuration Required</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Please configure your Shopify and Qikink API settings to start syncing orders.
                </p>
              </div>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-3 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Configure Now
              </button>
            </div>
          </div>
        )}

        <SearchAndFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        <StatsCards orders={orders} />

        {loading ? (
          <LoadingSpinner />
        ) : orders.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {orders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateTracking={handleUpdateTracking}
              />
            ))}
          </div>
        )}
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

export default App;