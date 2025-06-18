export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  trackingNumber?: string;
  carrier?: string;
  trackingUrl?: string;
  qikinkOrderId?: string;
  lastSyncAt?: string;
}

export interface TrackingUpdate {
  orderId: string;
  trackingNumber: string;
  carrier: string;
  status: string;
  trackingUrl?: string;
}

export interface QikinkApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export interface ApiConfig {
  qikinkApiKey: string;
  qikinkApiUrl: string;
  qikinkClientId: string;
  shopifyDomain: string;
  shopifyAccessToken: string;
}