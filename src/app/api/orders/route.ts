import { NextRequest, NextResponse } from 'next/server';
import { Order, LineItem } from '@/types';

// Mock data - used as fallback when no credentials provided
const mockOrders: Order[] = [
  {
    id: '1001',
    orderNumber: '#1001',
    customerName: 'Rajesh Kumar',
    customerFirstName: 'Rajesh',
    customerLastName: 'Kumar',
    customerEmail: 'rajesh@example.com',
    customerPhone: '+91 98765 43210',
    createdAt: '2024-01-15T10:30:00Z',
    status: 'processing',
    total: 2499.99,
    qikinkOrderId: 'QK-2024-001',
    lineItems: [
      { id: '1', name: 'Custom T-Shirt - Blue', quantity: 2, price: 999.99, variant_title: 'Large / Blue', product_id: 'p1', variant_id: 'v1' },
      { id: '2', name: 'Custom Mug - White', quantity: 1, price: 499.99, variant_title: 'Standard / White', product_id: 'p2', variant_id: 'v2' }
    ],
    tags: ['custom-print', 'bulk-order', 'priority'],
    paymentGateway: 'Razorpay',
    financialStatus: 'paid',
    fulfillmentStatus: null
  },
  {
    id: '1002',
    orderNumber: '#1002',
    customerName: 'Priya Sharma',
    customerFirstName: 'Priya',
    customerLastName: 'Sharma',
    customerEmail: 'priya@example.com',
    customerPhone: '+91 87654 32109',
    createdAt: '2024-01-14T14:22:00Z',
    status: 'shipped',
    total: 3599.50,
    trackingNumber: 'BD123456789',
    carrier: 'BlueDart',
    trackingUrl: 'https://bluedart.com/track/BD123456789',
    qikinkOrderId: 'QK-2024-002',
    lastSyncAt: '2024-01-16T09:15:00Z',
    lineItems: [
      { id: '3', name: 'Premium Hoodie - Black', quantity: 1, price: 1799.50, variant_title: 'Medium / Black', product_id: 'p3', variant_id: 'v3' },
      { id: '4', name: 'Phone Case - Custom Design', quantity: 3, price: 599.99, variant_title: 'iPhone 14 / Clear', product_id: 'p4', variant_id: 'v4' }
    ],
    tags: ['premium', 'express-shipping'],
    paymentGateway: 'PayPal',
    financialStatus: 'paid',
    fulfillmentStatus: 'shipped'
  },
  {
    id: '1003',
    orderNumber: '#1003',
    customerName: 'Amit Patel',
    customerFirstName: 'Amit',
    customerLastName: 'Patel',
    customerEmail: 'amit@example.com',
    customerPhone: '+91 76543 21098',
    createdAt: '2024-01-13T16:45:00Z',
    status: 'delivered',
    total: 1899.25,
    trackingNumber: 'DTDC987654321',
    carrier: 'DTDC',
    trackingUrl: 'https://dtdc.com/track/DTDC987654321',
    qikinkOrderId: 'QK-2024-003',
    lastSyncAt: '2024-01-17T11:30:00Z',
    lineItems: [
      { id: '5', name: 'Canvas Print - A3 Size', quantity: 1, price: 1899.25, variant_title: 'A3 / Matte Finish', product_id: 'p5', variant_id: 'v5' }
    ],
    tags: ['art-print', 'home-decor'],
    paymentGateway: 'Stripe',
    financialStatus: 'paid',
    fulfillmentStatus: 'fulfilled'
  },
  {
    id: '1004',
    orderNumber: '#1004',
    customerName: 'Sneha Gupta',
    customerFirstName: 'Sneha',
    customerLastName: 'Gupta',
    customerEmail: 'sneha@example.com',
    customerPhone: '+91 65432 10987',
    createdAt: '2024-01-16T08:12:00Z',
    status: 'pending',
    total: 4999.99,
    qikinkOrderId: 'QK-2024-004',
    lineItems: [
      { id: '6', name: 'Corporate Polo Shirts', quantity: 10, price: 499.99, variant_title: 'Large / Navy Blue', product_id: 'p6', variant_id: 'v6' }
    ],
    tags: ['corporate', 'bulk-order', 'embroidery'],
    paymentGateway: 'Bank Transfer',
    financialStatus: 'pending',
    fulfillmentStatus: null
  },
  {
    id: '1005',
    orderNumber: '#1005',
    customerName: 'Vikram Singh',
    customerFirstName: 'Vikram',
    customerLastName: 'Singh',
    customerEmail: 'vikram@example.com',
    customerPhone: '+91 54321 09876',
    createdAt: '2024-01-17T12:30:00Z',
    status: 'processing',
    total: 1299.00,
    qikinkOrderId: 'QK-2024-005',
    lineItems: [
      { id: '7', name: 'Laptop Sleeve - 15 inch', quantity: 1, price: 799.00, variant_title: '15 inch / Black', product_id: 'p7', variant_id: 'v7' },
      { id: '8', name: 'Mouse Pad - Gaming', quantity: 1, price: 499.99, variant_title: 'Large / RGB', product_id: 'p8', variant_id: 'v8' }
    ],
    tags: ['tech-accessories', 'gaming'],
    paymentGateway: 'UPI',
    financialStatus: 'paid',
    fulfillmentStatus: null
  },
  {
    id: '1006',
    orderNumber: '#1006',
    customerName: 'Kavya Reddy',
    customerFirstName: 'Kavya',
    customerLastName: 'Reddy',
    customerEmail: 'kavya@example.com',
    customerPhone: '+91 43210 98765',
    createdAt: '2024-01-18T15:45:00Z',
    status: 'shipped',
    total: 2799.75,
    trackingNumber: 'DEL456789123',
    carrier: 'Delhivery',
    trackingUrl: 'https://delhivery.com/track/DEL456789123',
    qikinkOrderId: 'QK-2024-006',
    lastSyncAt: '2024-01-19T10:20:00Z',
    lineItems: [
      { id: '9', name: 'Wedding Invitation Cards', quantity: 100, price: 27.99, variant_title: 'Premium / Gold Foil', product_id: 'p9', variant_id: 'v9' }
    ],
    tags: ['wedding', 'invitations', 'premium', 'gold-foil'],
    paymentGateway: 'Razorpay',
    financialStatus: 'paid',
    fulfillmentStatus: 'shipped'
  }
];

// Generate additional mock orders to simulate pagination
const generateMockOrders = (count: number): Order[] => {
  const additionalOrders: Order[] = [];
  const statuses: Order['status'][] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const carriers = ['BlueDart', 'DTDC', 'Delhivery', 'Ecom Express', 'India Post'];
  const gateways = ['Razorpay', 'PayPal', 'Stripe', 'UPI', 'Bank Transfer'];
  const names = [
    { first: 'Arjun', last: 'Mehta' },
    { first: 'Deepika', last: 'Rao' },
    { first: 'Karan', last: 'Joshi' },
    { first: 'Meera', last: 'Nair' },
    { first: 'Rohit', last: 'Agarwal' },
    { first: 'Sanya', last: 'Kapoor' },
    { first: 'Varun', last: 'Malhotra' },
    { first: 'Ananya', last: 'Iyer' },
    { first: 'Nikhil', last: 'Gupta' },
    { first: 'Pooja', last: 'Sharma' }
  ];

  const productNames = [
    'Custom T-Shirt', 'Printed Mug', 'Phone Case', 'Laptop Sticker', 'Tote Bag',
    'Poster Print', 'Business Cards', 'Keychain', 'Water Bottle', 'Notebook'
  ];

  const tagOptions = [
    ['custom-print', 'personalized'],
    ['bulk-order', 'wholesale'],
    ['premium', 'high-quality'],
    ['express-shipping', 'urgent'],
    ['corporate', 'business'],
    ['wedding', 'special-occasion'],
    ['tech-accessories', 'gadgets'],
    ['home-decor', 'interior'],
    ['gifts', 'presents'],
    ['promotional', 'marketing']
  ];

  for (let i = 7; i <= count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    const hasTracking = status === 'shipped' || status === 'delivered';
    const carrier = hasTracking ? carriers[Math.floor(Math.random() * carriers.length)] : undefined;
    const trackingNumber = hasTracking ? `TRK${String(i).padStart(9, '0')}` : undefined;
    const gateway = gateways[Math.floor(Math.random() * gateways.length)];
    const tags = tagOptions[Math.floor(Math.random() * tagOptions.length)];

    // Generate 1-3 line items per order
    const itemCount = Math.floor(Math.random() * 3) + 1;
    const lineItems: LineItem[] = [];
    let orderTotal = 0;

    for (let j = 0; j < itemCount; j++) {
      const productName = productNames[Math.floor(Math.random() * productNames.length)];
      const quantity = Math.floor(Math.random() * 5) + 1;
      const price = Math.floor(Math.random() * 2000) + 299;
      orderTotal += price * quantity;

      lineItems.push({
        id: `${i}-${j}`,
        name: `${productName} - Custom Design`,
        quantity,
        price,
        variant_title: 'Standard / Default',
        product_id: `p${i}-${j}`,
        variant_id: `v${i}-${j}`
      });
    }

    additionalOrders.push({
      id: String(1000 + i),
      orderNumber: `#${1000 + i}`,
      customerName: `${name.first} ${name.last}`,
      customerFirstName: name.first,
      customerLastName: name.last,
      customerEmail: `${name.first.toLowerCase()}.${name.last.toLowerCase()}@example.com`,
      customerPhone: `+91 ${String(Math.floor(Math.random() * 90000) + 10000)} ${String(Math.floor(Math.random() * 90000) + 10000)}`,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status,
      total: orderTotal,
      trackingNumber,
      carrier,
      trackingUrl: trackingNumber && carrier ? `https://${carrier.toLowerCase()}.com/track/${trackingNumber}` : undefined,
      qikinkOrderId: `QK-2024-${String(i).padStart(3, '0')}`,
      lastSyncAt: hasTracking ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      lineItems,
      tags,
      paymentGateway: gateway,
      financialStatus: status === 'pending' ? 'pending' : 'paid',
      fulfillmentStatus: hasTracking ? (status === 'delivered' ? 'fulfilled' : 'shipped') : null
    });
  }

  return additionalOrders;
};

async function fetchShopifyOrders(domain: string, accessToken: string, limit: number = 200): Promise<Order[]> {
  try {
    // Clean domain - remove protocol and trailing slashes
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    const response = await fetch(`https://${cleanDomain}/admin/api/2023-10/orders.json?limit=${limit}&status=any&fields=id,name,customer,created_at,updated_at,total_price,financial_status,fulfillment_status,tags,gateway,line_items,fulfillments,note_attributes,email,phone`, {
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
    
    // Transform orders without making additional API calls
    const transformedOrders = data.orders.map((order: any) => {
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

      // Transform line items
      const lineItems: LineItem[] = order.line_items?.map((item: any) => ({
        id: item.id.toString(),
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price),
        variant_title: item.variant_title,
        product_id: item.product_id?.toString(),
        variant_id: item.variant_id?.toString()
      })) || [];

      // Parse tags
      const tags = order.tags ? order.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : [];

      // Get customer details directly from the order object
      const customer = order.customer;
      const customerFirstName = customer?.first_name || '';
      const customerLastName = customer?.last_name || '';
      const customerName = `${customerFirstName} ${customerLastName}`.trim() || 'Guest';

      return {
        id: order.id.toString(),
        orderNumber: order.name,
        customerName,
        customerFirstName,
        customerLastName,
        customerEmail: customer?.email || order.email || '',
        customerPhone: customer?.phone || order.phone || '',
        createdAt: order.created_at,
        status: mapShopifyStatus(order.fulfillment_status, order.financial_status),
        total: parseFloat(order.total_price || '0'),
        trackingNumber: trackingNumber || undefined,
        carrier: carrier || undefined,
        trackingUrl: trackingUrl || undefined,
        qikinkOrderId: qikinkOrderId || undefined,
        lastSyncAt: lastSyncAt || order.updated_at,
        lineItems,
        tags,
        paymentGateway: order.gateway || 'Unknown',
        financialStatus: order.financial_status,
        fulfillmentStatus: order.fulfillment_status
      };
    });

    return transformedOrders;
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
        (order.qikinkOrderId && order.qikinkOrderId.toLowerCase().includes(search.toLowerCase())) ||
        (order.lineItems && order.lineItems.some(item => item.name.toLowerCase().includes(search.toLowerCase()))) ||
        (order.tags && order.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())));
      
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