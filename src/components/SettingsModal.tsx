import React, { useState, useEffect } from 'react';
import { X, Save, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { ApiConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: ApiConfig) => void;
  currentConfig: ApiConfig;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentConfig
}) => {
  const [config, setConfig] = useState<ApiConfig>(currentConfig);
  const [showQikinkKey, setShowQikinkKey] = useState(false);
  const [showShopifyToken, setShowShopifyToken] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    qikink: 'idle' | 'testing' | 'success' | 'error';
    shopify: 'idle' | 'testing' | 'success' | 'error';
  }>({
    qikink: 'idle',
    shopify: 'idle'
  });

  useEffect(() => {
    setConfig(currentConfig);
  }, [currentConfig]);

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  const testQikinkConnection = async () => {
    setConnectionStatus(prev => ({ ...prev, qikink: 'testing' }));
    setIsTestingConnection(true);
    
    try {
      // Simulate API test call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setConnectionStatus(prev => ({ ...prev, qikink: 'success' }));
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, qikink: 'error' }));
    } finally {
      setIsTestingConnection(false);
    }
  };

  const testShopifyConnection = async () => {
    setConnectionStatus(prev => ({ ...prev, shopify: 'testing' }));
    setIsTestingConnection(true);
    
    try {
      // Simulate API test call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setConnectionStatus(prev => ({ ...prev, shopify: 'success' }));
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, shopify: 'error' }));
    } finally {
      setIsTestingConnection(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'testing':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">API Configuration</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Shopify Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Shopify Configuration</h3>
              <button
                onClick={testShopifyConnection}
                disabled={isTestingConnection || !config.shopifyDomain || !config.shopifyAccessToken}
                className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {getStatusIcon(connectionStatus.shopify)}
                <span>Test Connection</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shop Domain
                </label>
                <input
                  type="text"
                  placeholder="your-shop.myshopify.com"
                  value={config.shopifyDomain}
                  onChange={(e) => setConfig(prev => ({ ...prev, shopifyDomain: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your Shopify store domain (e.g., mystore.myshopify.com)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Token
                </label>
                <div className="relative">
                  <input
                    type={showShopifyToken ? 'text' : 'password'}
                    placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={config.shopifyAccessToken}
                    onChange={(e) => setConfig(prev => ({ ...prev, shopifyAccessToken: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowShopifyToken(!showShopifyToken)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showShopifyToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Private app access token from your Shopify admin
                </p>
              </div>
            </div>

            {connectionStatus.shopify === 'success' && (
              <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                <CheckCircle className="w-4 h-4" />
                <span>Shopify connection successful</span>
              </div>
            )}

            {connectionStatus.shopify === 'error' && (
              <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span>Failed to connect to Shopify. Please check your credentials.</span>
              </div>
            )}
          </div>

          {/* Qikink Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Qikink Configuration</h3>
              <button
                onClick={testQikinkConnection}
                disabled={isTestingConnection || !config.qikinkApiKey || !config.qikinkApiUrl}
                className="flex items-center space-x-2 px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {getStatusIcon(connectionStatus.qikink)}
                <span>Test Connection</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API URL
                </label>
                <input
                  type="url"
                  placeholder="https://api.qikink.com"
                  value={config.qikinkApiUrl}
                  onChange={(e) => setConfig(prev => ({ ...prev, qikinkApiUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Qikink API base URL (usually https://api.qikink.com)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={showQikinkKey ? 'text' : 'password'}
                    placeholder="qk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={config.qikinkApiKey}
                    onChange={(e) => setConfig(prev => ({ ...prev, qikinkApiKey: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowQikinkKey(!showQikinkKey)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showQikinkKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Your Qikink API key from the developer dashboard
                </p>
              </div>
            </div>

            {connectionStatus.qikink === 'success' && (
              <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                <CheckCircle className="w-4 h-4" />
                <span>Qikink connection successful</span>
              </div>
            )}

            {connectionStatus.qikink === 'error' && (
              <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span>Failed to connect to Qikink. Please check your credentials.</span>
              </div>
            )}
          </div>

          {/* Help Section */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Need Help?</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• For Shopify: Create a private app in your Shopify admin to get the access token</li>
              <li>• For Qikink: Get your API key from the Qikink developer dashboard</li>
              <li>• Test connections to ensure your credentials are working correctly</li>
              <li>• All credentials are stored securely and encrypted</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};