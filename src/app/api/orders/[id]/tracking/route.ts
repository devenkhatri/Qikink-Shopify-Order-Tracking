import { NextRequest, NextResponse } from 'next/server';

interface TrackingUpdateRequest {
  trackingNumber: string;
  trackingUrl?: string;
  status?: string;
}

async function updateShopifyOrder(
  orderId: string,
  trackingData: TrackingUpdateRequest,
  domain: string,
  accessToken: string
) {
  try {
    // Update Shopify order with tracking information
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
              name: 'tracking_number',
              value: trackingData.trackingNumber
            },
            {
              name: 'tracking_url',
              value: trackingData.trackingUrl || ''
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
    console.error('Error updating Shopify order:', error);
    throw error;
  }
}

async function updateQikinkTracking(
  qikinkOrderId: string,
  trackingData: TrackingUpdateRequest,
  clientId: string,
  accessToken: string,
  apiUrl: string
) {
  try {
    const response = await fetch(`${apiUrl}/orders/${qikinkOrderId}/tracking`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Client-ID': clientId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tracking_number: trackingData.trackingNumber,
        tracking_url: trackingData.trackingUrl,
        status: trackingData.status || 'shipped'
      })
    });

    if (!response.ok) {
      throw new Error(`Qikink API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating Qikink tracking:', error);
    throw error;
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const trackingData: TrackingUpdateRequest = await request.json();

    // Get API credentials from headers
    const shopifyDomain = request.headers.get('x-shopify-domain');
    const shopifyToken = request.headers.get('x-shopify-token');
    const qikinkClientId = request.headers.get('x-qikink-client-id');
    const qikinkAccessToken = request.headers.get('x-qikink-access-token');
    const qikinkApiUrl = request.headers.get('x-qikink-api-url');
    const qikinkOrderId = request.headers.get('x-qikink-order-id');

    const results = {
      shopify: null as any,
      qikink: null as any,
      errors: [] as string[]
    };

    // Update Shopify order
    if (shopifyDomain && shopifyToken) {
      try {
        results.shopify = await updateShopifyOrder(
          orderId,
          trackingData,
          shopifyDomain,
          shopifyToken
        );
      } catch (error) {
        results.errors.push(`Shopify update failed: ${error}`);
      }
    }

    // Update Qikink tracking
    if (qikinkOrderId && qikinkClientId && qikinkAccessToken && qikinkApiUrl) {
      try {
        results.qikink = await updateQikinkTracking(
          qikinkOrderId,
          trackingData,
          qikinkClientId,
          qikinkAccessToken,
          qikinkApiUrl
        );
      } catch (error) {
        results.errors.push(`Qikink update failed: ${error}`);
      }
    }

    // Simulate successful update for demo
    if (!shopifyDomain && !qikinkClientId) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return NextResponse.json({
      success: results.errors.length === 0,
      data: {
        orderId,
        trackingNumber: trackingData.trackingNumber,
        trackingUrl: trackingData.trackingUrl,
        status: trackingData.status || 'shipped',
        updatedAt: new Date().toISOString(),
        shopifyResult: results.shopify,
        qikinkResult: results.qikink
      },
      errors: results.errors.length > 0 ? results.errors : undefined,
      message: results.errors.length === 0 
        ? 'Tracking information updated successfully'
        : 'Partial update completed with some errors'
    });
  } catch (error) {
    console.error('Error in tracking update API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update tracking information' },
      { status: 500 }
    );
  }
}