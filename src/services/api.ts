import { ApiConfig, Order, QikinkApiResponse, TrackingUpdate } from '../types';

// Shopify API endpoints
const SHOPIFY_API_VERSION = '2024-01';

export const shopifyApi = {
  async fetchOrders(config: ApiConfig): Promise<Order[]> {
    try {
      const response = await fetch(
        `https://${config.shopifyDomain}/admin/api/${SHOPIFY_API_VERSION}/orders.json?status=any`,
        {
          headers: {
            'X-Shopify-Access-Token': config.shopifyAccessToken,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Shopify API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`Failed to fetch Shopify orders: ${response.statusText}`);
      }

      const data = await response.json();
      return data.orders.map((order: any) => ({
        id: order.id.toString(),
        orderNumber: `#${order.order_number}`,
        customerName: `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.trim() || 'Guest',
        customerEmail: order.customer?.email || '',
        createdAt: order.created_at,
        status: mapShopifyStatus(order.fulfillment_status || order.financial_status),
        total: parseFloat(order.total_price),
        trackingNumber: order.fulfillments?.[0]?.tracking_number,
        carrier: order.fulfillments?.[0]?.tracking_company,
        trackingUrl: order.fulfillments?.[0]?.tracking_url,
        qikinkOrderId: order.tags?.split(',').find((tag: string) => tag.startsWith('qikink:'))?.split(':')[1],
        lastSyncAt: order.updated_at,
      }));
    } catch (error) {
      console.error('Shopify API Error:', error);
      throw error;
    }
  },

  async updateOrderTracking(config: ApiConfig, orderId: string, trackingData: TrackingUpdate): Promise<void> {
    try {
      const response = await fetch(
        `https://${config.shopifyDomain}/admin/api/${SHOPIFY_API_VERSION}/orders/${orderId}/fulfillments.json`,
        {
          method: 'POST',
          headers: {
            'X-Shopify-Access-Token': config.shopifyAccessToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fulfillment: {
              tracking_number: trackingData.trackingNumber,
              tracking_company: trackingData.carrier,
              tracking_url: trackingData.trackingUrl,
              notify_customer: true,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Shopify API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`Failed to update Shopify order tracking: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Shopify API Error:', error);
      throw error;
    }
  },

  async testConnection(config: ApiConfig): Promise<boolean> {
    try {
      console.log('Testing Shopify connection with:', {
        domain: config.shopifyDomain,
        tokenLength: config.shopifyAccessToken.length
      });

      const response = await fetch(
        `https://${config.shopifyDomain}/admin/api/${SHOPIFY_API_VERSION}/shop.json`,
        {
          headers: {
            'X-Shopify-Access-Token': config.shopifyAccessToken,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Shopify Connection Test Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        return false;
      }

      const data = await response.json();
      console.log('Shopify connection successful:', data);
      return true;
    } catch (error) {
      console.error('Shopify Connection Test Error:', error);
      return false;
    }
  },
};

// Qikink API endpoints
export const qikinkApi = {
  async updateTracking(config: ApiConfig, trackingData: TrackingUpdate): Promise<QikinkApiResponse> {
    try {
      const response = await fetch(`${config.qikinkApiUrl}/api/v1/tracking/update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.qikinkApiKey}`,
          'X-Client-ID': config.qikinkClientId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trackingData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Qikink API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`Failed to update Qikink tracking: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Qikink API Error:', error);
      throw error;
    }
  },

  async syncOrderStatus(config: ApiConfig, qikinkOrderId: string): Promise<QikinkApiResponse> {
    try {
      const response = await fetch(`${config.qikinkApiUrl}/api/v1/orders/${qikinkOrderId}/status`, {
        headers: {
          'Authorization': `Bearer ${config.qikinkApiKey}`,
          'X-Client-ID': config.qikinkClientId,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Qikink API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`Failed to sync Qikink order status: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Qikink API Error:', error);
      throw error;
    }
  },

  async testConnection(config: ApiConfig): Promise<boolean> {
    try {
      console.log('Testing Qikink connection with:', {
        url: config.qikinkApiUrl,
        clientId: config.qikinkClientId,
        keyLength: config.qikinkApiKey.length
      });

      const response = await fetch(`${config.qikinkApiUrl}/api/v1/health`, {
        headers: {
          'Authorization': `Bearer ${config.qikinkApiKey}`,
          'X-Client-ID': config.qikinkClientId,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Qikink Connection Test Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        return false;
      }

      const data = await response.json();
      console.log('Qikink connection successful:', data);
      return true;
    } catch (error) {
      console.error('Qikink Connection Test Error:', error);
      return false;
    }
  },
};

// Helper function to map Shopify status to our status
function mapShopifyStatus(status: string): Order['status'] {
  switch (status?.toLowerCase()) {
    case 'pending':
    case 'unfulfilled':
      return 'pending';
    case 'fulfilled':
      return 'shipped';
    case 'delivered':
      return 'delivered';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'processing';
  }
} 