import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/types';

// Mock data - used as fallback when no credentials provided
const mockOrders: Order[] = [
  {
    id: '1001',
    orderNumber: '#1001',
    customerName: 'Rajesh Kumar',
    customerEmail: 'rajesh@example.com',
    customerPhone: '+91 98765 43210',
    createdAt: '2024-01-15T10:30:00Z',
    status: 'processing',
    total: 2499.99,
    qikinkOrderId: 'QK-2024-001'
  },
  {
    id: '1002',
    orderNumber: '#1002',
    customerName: 'Priya Sharma',
    customerEmail: 'priya@example.com',
    customerPhone: '+91 87654 32109',
    createdAt: '2024-01-14T14:22:00Z',
    status: 'shipped',
    total: 3599.50,
    trackingNumber: 'BD123456789',
    carrier: 'BlueDart',
    trackingUrl: 'https://bluedart.com/track/BD123456789',
    qikinkOrderId: 'QK-2024-002',
    lastSyncAt: '2024-01-16T09:15:00Z'
  },
  {
    id: '1003',
    orderNumber: '#1003',
    customerName: 'Amit Patel',
    customerEmail: 'amit@example.com',
    customerPhone: '+91 76543 21098',
    createdAt: '2024-01-13T16:45:00Z',
    status: 'delivered',
    total: 1899.25,
    trackingNumber: 'DTDC987654321',
    carrier: 'DTDC',
    trackingUrl: 'https://dtdc.com/track/DTDC987654321',
    qikinkOrderId: 'QK-2024-003',
    lastSyncAt: '2024-01-17T11:30:00Z'
  },
  {
    id: '1004',
    orderNumber: '#1004',
    customerName: 'Sneha Gupta',
    customerEmail: 'sneha@example.com',
    customerPhone: '+91 65432 10987',
    createdAt: '2024-01-16T08:12:00Z',
    status: 'pending',
    total: 4999.99,
    qikinkOrderId: 'QK-2024-004'
  },
  {
    id: '1005',
    orderNumber: '#1005',
    customerName: 'Vikram Singh',
    customerEmail: 'vikram@example.com',
    customerPhone: '+91 54321 09876',
    createdAt: '2024-01-17T12:30:00Z',
    status: 'processing',
    total: 1299.00,
    qikinkOrderId: 'QK-2024-005'
  },
  {
    id: '1006',
    orderNumber: '#1006',
    customerName: 'Kavya Reddy',
    customerEmail: 'kavya@example.com',
    customerPhone: '+91 43210 98765',
    createdAt: '2024-01-18T15:45:00Z',
    status: 'shipped',
    total: 2799.75,
    trackingNumber: 'DEL456789123',
    carrier: 'Delhivery',
    trackingUrl: 'https://delhivery.com/track/DEL456789123',
    qikinkOrderId: 'QK-2024-006',
    lastSyncAt: '2024-01-19T10:20:00Z'
  }
];

// Generate additional mock orders to simulate pagination
const generateMockOrders = (count: number): Order[] => {
  const additionalOrders: Order[] = [];
  const statuses: Order['status'][] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const carriers = ['BlueDart', 'DTDC', 'Delhivery', 'Ecom Express', 'India Post'];
  const names = [
    'Arjun Mehta', 'Deepika Rao', 'Karan Joshi', 'Meera Nair', 'Rohit Agarwal',
    'Sanya Kapoor', 'Varun Malhotra', 'Ananya Iyer', 'Nikhil Gupta', 'Pooja Sharma'
  ];

  for (let i = 7; i <= count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    const hasTracking = status === 'shipped' || status === 'delivered';
    const carrier = hasTracking ? carriers[Math.floor(Math.random() * carriers.length)] : undefined;
    const trackingNumber = hasTracking ? `TRK${String(i).padStart(9, '0')}` : undefined;

    additionalOrders.push({
      id: String(1000 + i),
      orderNumber: `#${1000 + i}`,
      customerName: name,
      customerEmail: `${name.toLowerCase().replace(' ', '.')}@example.com`,
      customerPhone: `+91 ${String(Math.floor(Math.random() * 90000) + 10000)} ${String(Math.floor(Math.random() * 90000) + 10000)}`,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status,
      total: Math.floor(Math.random() * 5000) + 500,
      trackingNumber,
      carrier,
      trackingUrl: trackingNumber && carrier ? `https://${carrier.toLowerCase()}.com/track/${trackingNumber}` : undefined,
      qikinkOrderId: `QK-2024-${String(i).padStart(3, '0')}`,
      lastSyncAt: hasTracking ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined
    });
  }

  return additionalOrders;
};

async function fetchShopifyOrders(domain: string, accessToken: string, limit: number = 200): Promise<Order[]> {
  try {
    // Clean domain - remove protocol and trailing slashes
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    const response = await fetch(`https://${cleanDomain}/admin/api/2023-10/orders.json?limit=${limit}&status=any`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    // Transform Shopify orders to our Order interface
    return data.orders.map((order: any) => {
      // Extract tracking information from fulfillments
      let trackingNumber = '';
      let carrier = '';
      let trackingUrl = '';
      
      if (order.fulfillments && order.fulfillments.length > 0) {
        const fulfillment = order.fulfillments[0];
        if (fulfillment.tracking_number) {
          trackingNumber = fulfillment.tracking_number;
          carrier = fulfillment.tracking_company || 'Unknown';
          trackingUrl = fulfillment.tracking_url || '';
        }
      }

      // Extract Qikink order ID from note attributes
      const qikinkOrderId = order.note_attributes?.find(
        (attr: any) => attr.name === 'qikink_order_id' || attr.name === 'qikink_id'
      )?.value;

      // Extract last sync time from note attributes
      const lastSyncAt = order.note_attributes?.find(
        (attr: any) => attr.name === 'last_sync' || attr.name === 'qikink_last_sync'
      )?.value;

      console.log("*** order", order)

      return {
        id: order.id.toString(),
        orderNumber: order.name,
        customerName: order.customer 
          ? `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim() || 'Guest'
          : 'Guest',
        customerEmail: order.customer?.email || order.email || '',
        customerPhone: order.customer?.phone || order.phone || '',
        createdAt: order.created_at,
        status: mapShopifyStatus(order.fulfillment_status, order.financial_status),
        total: parseFloat(order.total_price || '0'),
        trackingNumber: trackingNumber || undefined,
        carrier: carrier || undefined,
        trackingUrl: trackingUrl || undefined,
        qikinkOrderId: qikinkOrderId || undefined,
        lastSyncAt: lastSyncAt || order.updated_at
      };
    });
  } catch (error) {
    console.error('Error fetching Shopify orders:', error);
    throw error;
  }
}

function mapShopifyStatus(fulfillmentStatus: string | null, financialStatus: string): Order['status'] {
  // Map Shopify fulfillment and financial status to our order status
  if (fulfillmentStatus === 'fulfilled') return 'delivered';
  if (fulfillmentStatus === 'partial') return 'shipped';
  if (fulfillmentStatus === 'shipped') return 'shipped';
  if (fulfillmentStatus === 'restocked') return 'cancelled';
  
  // If no fulfillment status, check financial status
  if (financialStatus === 'paid') return 'processing';
  if (financialStatus === 'pending') return 'pending';
  if (financialStatus === 'authorized') return 'pending';
  if (financialStatus === 'partially_paid') return 'pending';
  if (financialStatus === 'refunded') return 'cancelled';
  if (financialStatus === 'voided') return 'cancelled';
  
  return 'pending';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    
    // Get API credentials from headers
    const shopifyDomain = request.headers.get('x-shopify-domain');
    const shopifyToken = request.headers.get('x-shopify-token');

    let orders: Order[] = [];

    if (shopifyDomain && shopifyToken) {
      try {
        orders = await fetchShopifyOrders(shopifyDomain, shopifyToken, 200);
      } catch (error) {
        console.error('Failed to fetch Shopify orders, using mock data:', error);
        // Return error response instead of falling back to mock data
        return NextResponse.json({
          success: false,
          error: `Failed to fetch orders from Shopify: ${error instanceof Error ? error.message : 'Unknown error'}`,
          data: [],
          total: 0,
          totalPages: 0,
          currentPage: page,
          hasNextPage: false,
          hasPrevPage: false
        }, { status: 500 });
      }
    } else {
      // Use mock data if no credentials provided (for demo purposes)
      // Generate 200+ orders for pagination demo
      const allMockOrders = [...mockOrders, ...generateMockOrders(200)];
      orders = allMockOrders;
    }

    // Apply filters
    const filteredOrders = orders.filter(order => {
      const matchesSearch = !search || 
        order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        order.customerName.toLowerCase().includes(search.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
        (order.customerPhone && order.customerPhone.toLowerCase().includes(search.toLowerCase())) ||
        (order.trackingNumber && order.trackingNumber.toLowerCase().includes(search.toLowerCase())) ||
        (order.qikinkOrderId && order.qikinkOrderId.toLowerCase().includes(search.toLowerCase()));
      
      const matchesStatus = status === 'all' || order.status === status;
      
      return matchesSearch && matchesStatus;
    });

    // Sort orders by creation date (newest first)
    filteredOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply pagination
    const totalOrders = filteredOrders.length;
    const totalPages = Math.ceil(totalOrders / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedOrders,
      total: totalOrders,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      isLiveData: !!(shopifyDomain && shopifyToken)
    });
  } catch (error) {
    console.error('Error in orders API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch orders',
        data: [],
        total: 0,
        totalPages: 0,
        currentPage: 1,
        hasNextPage: false,
        hasPrevPage: false
      },
      { status: 500 }
    );
  }
}