export interface LineItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  variant_title?: string;
  product_id: string;
  variant_id: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerFirstName?: string;
  customerLastName?: string;
  createdAt: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  trackingNumber?: string;
  carrier?: string;
  trackingUrl?: string;
  qikinkOrderId?: string;
  lastSyncAt?: string;
  lineItems?: LineItem[];
  tags?: string[];
  paymentGateway?: string;
  financialStatus?: string;
  fulfillmentStatus?: string;
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
  qikinkClientId: string;
  qikinkAccessToken: string;
  qikinkApiUrl: string;
  shopifyDomain: string;
  shopifyAccessToken: string;
}

export interface PaginationInfo {
  total: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export type ViewMode = 'grid' | 'list';