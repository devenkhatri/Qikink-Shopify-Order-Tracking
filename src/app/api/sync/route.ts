import { NextRequest, NextResponse } from 'next/server';

async function syncOrderWithQikink(
  qikinkOrderId: string,
  clientId: string,
  accessToken: string,
  apiUrl: string
) {
  try {
    const response = await fetch(`${apiUrl}/orders/${qikinkOrderId}/status`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Client-ID': clientId,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Qikink API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error syncing with Qikink:', error);
    throw error;
  }
}

async function updateShopifyOrderStatus(
  orderId: string,
  qikinkData: any,
  domain: string,
  accessToken: string
) {
  try {
    const response = await fetch(`https://${domain}/admin/api/2023-10/orders/${orderId}.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order: {
          id: orderId,
          note_attributes: [
            {
              name: 'qikink_status',
              value: qikinkData.status
            },
            {
              name: 'tracking_number',
              value: qikinkData.tracking_number || ''
            },
            {
              name: 'carrier',
              value: qikinkData.carrier || ''
            },
            {
              name: 'last_sync',
              value: new Date().toISOString()
            }
          ]
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating Shopify order status:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { orderIds } = await request.json();

    // Get API credentials from headers
    const shopifyDomain = request.headers.get('x-shopify-domain');
    const shopifyToken = request.headers.get('x-shopify-token');
    const qikinkClientId = request.headers.get('x-qikink-client-id');
    const qikinkAccessToken = request.headers.get('x-qikink-access-token');
    const qikinkApiUrl = request.headers.get('x-qikink-api-url');

    if (!shopifyDomain || !shopifyToken || !qikinkClientId || !qikinkAccessToken || !qikinkApiUrl) {
      // Simulate sync for demo purposes
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return NextResponse.json({
        success: true,
        data: {
          syncedCount: orderIds?.length || 0,
          timestamp: new Date().toISOString()
        },
        message: 'Orders synced successfully (demo mode)'
      });
    }

    const syncResults = [];
    const errors = [];

    // Process each order (in production, you might want to batch this)
    for (const orderId of orderIds || []) {
      try {
        // Get Qikink order ID from Shopify order
        const shopifyResponse = await fetch(`https://${shopifyDomain}/admin/api/2023-10/orders/${orderId}.json`, {
          headers: {
            'X-Shopify-Access-Token': shopifyToken,
            'Content-Type': 'application/json',
          },
        });

        if (!shopifyResponse.ok) {
          throw new Error(`Failed to fetch Shopify order ${orderId}`);
        }

        const shopifyOrder = await shopifyResponse.json();
        const qikinkOrderId = shopifyOrder.order.note_attributes?.find(
          (attr: any) => attr.name === 'qikink_order_id'
        )?.value;

        if (!qikinkOrderId) {
          errors.push(`No Qikink order ID found for Shopify order ${orderId}`);
          continue;
        }

        // Sync with Qikink
        const qikinkData = await syncOrderWithQikink(
          qikinkOrderId, 
          qikinkClientId, 
          qikinkAccessToken, 
          qikinkApiUrl
        );

        // Update Shopify with Qikink data
        const updateResult = await updateShopifyOrderStatus(
          orderId,
          qikinkData,
          shopifyDomain,
          shopifyToken
        );

        syncResults.push({
          orderId,
          qikinkOrderId,
          status: qikinkData.status,
          trackingNumber: qikinkData.tracking_number,
          carrier: qikinkData.carrier
        });
      } catch (error) {
        errors.push(`Failed to sync order ${orderId}: ${error}`);
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      data: {
        syncedCount: syncResults.length,
        results: syncResults,
        timestamp: new Date().toISOString()
      },
      errors: errors.length > 0 ? errors : undefined,
      message: errors.length === 0 
        ? `Successfully synced ${syncResults.length} orders`
        : `Synced ${syncResults.length} orders with ${errors.length} errors`
    });
  } catch (error) {
    console.error('Error in sync API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync orders' },
      { status: 500 }
    );
  }
}