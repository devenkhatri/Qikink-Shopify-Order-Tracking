import { useState } from 'react';
import { QikinkApiResponse, TrackingUpdate } from '../types';
import { qikinkApi } from '../services/api';
import { useSettings } from './useSettings';

export const useQikinkApi = () => {
  const { config } = useSettings();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTracking = async (trackingData: TrackingUpdate): Promise<QikinkApiResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await qikinkApi.updateTracking(config, trackingData);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update tracking information';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const syncOrderStatus = async (qikinkOrderId: string): Promise<QikinkApiResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await qikinkApi.syncOrderStatus(config, qikinkOrderId);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync order status';
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
    updateTracking,
    syncOrderStatus,
    loading,
    error
  };
};