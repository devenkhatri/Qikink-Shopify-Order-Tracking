import { useState, useEffect } from 'react';
import { ApiConfig } from '../types';

const DEFAULT_CONFIG: ApiConfig = {
  qikinkApiKey: '',
  qikinkApiUrl: 'https://api.qikink.com',
  qikinkClientId: '',
  shopifyDomain: '',
  shopifyAccessToken: ''
};

const STORAGE_KEY = 'qikink-shopify-config';

export const useSettings = () => {
  const [config, setConfig] = useState<ApiConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load configuration from localStorage
    const loadConfig = () => {
      try {
        const savedConfig = localStorage.getItem(STORAGE_KEY);
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig);
          setConfig({ ...DEFAULT_CONFIG, ...parsedConfig });
        }
      } catch (error) {
        console.error('Failed to load configuration:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  const saveConfig = (newConfig: ApiConfig) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      setConfig(newConfig);
    } catch (error) {
      console.error('Failed to save configuration:', error);
      throw new Error('Failed to save configuration');
    }
  };

  const isConfigured = () => {
    return !!(
      config.qikinkApiKey &&
      config.qikinkApiUrl &&
      config.shopifyDomain &&
      config.shopifyAccessToken
    );
  };

  const clearConfig = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setConfig(DEFAULT_CONFIG);
    } catch (error) {
      console.error('Failed to clear configuration:', error);
    }
  };

  return {
    config,
    saveConfig,
    isConfigured,
    clearConfig,
    isLoading
  };
};