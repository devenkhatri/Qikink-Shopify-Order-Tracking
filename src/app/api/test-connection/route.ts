import { NextRequest, NextResponse } from 'next/server';

async function testShopifyConnection(domain: string, accessToken: string) {
  try {
    // Clean domain - remove protocol and trailing slashes
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    const response = await fetch(`https://${cleanDomain}/admin/api/2023-10/shop.json`, {
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
    return {
      success: true,
      data: {
        shopName: data.shop.name,
        domain: data.shop.domain,
        email: data.shop.email,
        currency: data.shop.currency,
        timezone: data.shop.timezone
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `Shopify connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function testQikinkConnection(clientId: string, accessToken: string, apiUrl: string) {
  try {
    // Clean API URL - remove trailing slashes
    const cleanApiUrl = apiUrl.replace(/\/$/, '');
    
    const response = await fetch(`${cleanApiUrl}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Client-ID': clientId,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: {
        clientId: data.client_id || clientId,
        accountType: data.account_type || 'standard',
        userId: data.user_id,
        accountStatus: data.status,
        permissions: data.permissions || []
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `Qikink connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { provider, ...credentials } = await request.json();

    if (provider === 'shopify') {
      const { domain, accessToken } = credentials;
      
      if (!domain || !accessToken) {
        return NextResponse.json(
          { success: false, error: 'Domain and access token are required' },
          { status: 400 }
        );
      }

      const result = await testShopifyConnection(domain, accessToken);
      return NextResponse.json(result);
    }

    if (provider === 'qikink') {
      const { clientId, accessToken, apiUrl } = credentials;
      
      if (!clientId || !accessToken || !apiUrl) {
        return NextResponse.json(
          { success: false, error: 'Client ID, access token and API URL are required' },
          { status: 400 }
        );
      }

      const result = await testQikinkConnection(clientId, accessToken, apiUrl);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { success: false, error: 'Invalid provider' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in test connection API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to test connection' },
      { status: 500 }
    );
  }
}