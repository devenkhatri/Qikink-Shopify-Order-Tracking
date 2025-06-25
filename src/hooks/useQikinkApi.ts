'use client';

import { useState } from 'react';
import { useSettings } from './useSettings';

export const useQikinkApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { config } = useSettings();

  const testConnection = async (provider: 'shopify' | 'qikink', credentials: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          ...credentials
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to test connection');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = `Failed to test ${provider} connection`;
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const syncOrderStatus = async (qikinkOrderId: string) => {
    setLoading(true);
    setError(null);

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add API credentials to headers
      if (config.qikinkClientId) {
        headers['x-qikink-client-id'] = config.qikinkClientId;
      }
      if (config.qikinkAccessToken) {
        headers['x-qikink-access-token'] = config.qikinkAccessToken;
      }
      if (config.qikinkApiUrl) {
        headers['x-qikink-api-url'] = config.qikinkApiUrl;
      }

      const response = await fetch('/api/sync', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          orderIds: [qikinkOrderId]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to sync order status');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = 'Failed to sync order status';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    testConnection,
    syncOrderStatus,
    loading,
    error
  };
};