/**
 * QuickBooks Payments Service
 * Handles OAuth, payment creation, and webhook verification
 */

import crypto from 'crypto';

// QuickBooks API URLs
// Payments API uses different base URLs than regular QuickBooks API
// Reference: https://developer.intuit.com/app/developer/qbpayments/docs/api/resources/all-entities/charges
const QB_BASE_URL = import.meta.env.QUICKBOOKS_ENVIRONMENT === 'production'
  ? 'https://api.intuit.com'
  : 'https://sandbox.api.intuit.com';

const QB_OAUTH_URL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';

export interface PaymentCharge {
  amount: number;
  currency: string;
  description: string;
  customer: {
    email: string;
    name: string;
  };
  cardToken?: string;
}

export interface QBTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

/**
 * Get OAuth authorization URL
 */
export function getAuthorizationUrl(state: string): string {
  const clientId = import.meta.env.QUICKBOOKS_CLIENT_ID;
  const redirectUri = import.meta.env.QUICKBOOKS_REDIRECT_URI;

  // QuickBooks Payments requires both accounting and payment scopes
  // Reference: https://developer.intuit.com/app/developer/qbpayments/docs/get-started
  const scopes = [
    'com.intuit.quickbooks.accounting',
    'com.intuit.quickbooks.payment'
  ].join(' ');

  return `https://appcenter.intuit.com/connect/oauth2?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `state=${state}`;
}

/**
 * Exchange authorization code for access token
 */
export async function getAccessToken(authCode: string): Promise<QBTokens> {
  const clientId = import.meta.env.QUICKBOOKS_CLIENT_ID;
  const clientSecret = import.meta.env.QUICKBOOKS_CLIENT_SECRET;
  const redirectUri = import.meta.env.QUICKBOOKS_REDIRECT_URI;

  const response = await fetch(QB_OAUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: authCode,
      redirect_uri: redirectUri,
    }).toString(),
  });

  // Log intuit_tid for debugging (Intuit recommendation)
  const intuitTid = response.headers.get('intuit_tid');
  console.log('[QuickBooks OAuth] intuit_tid:', intuitTid);

  if (!response.ok) {
    const err = await response.text();
    console.error('[QuickBooks OAuth] Token exchange failed. intuit_tid:', intuitTid);
    throw new Error(`OAuth token exchange failed: ${err}`);
  }

  return response.json();
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<QBTokens> {
  const clientId = import.meta.env.QUICKBOOKS_CLIENT_ID;
  const clientSecret = import.meta.env.QUICKBOOKS_CLIENT_SECRET;

  const response = await fetch(QB_OAUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }).toString(),
  });

  // Log intuit_tid for debugging (Intuit recommendation)
  const intuitTid = response.headers.get('intuit_tid');
  console.log('[QuickBooks Refresh] intuit_tid:', intuitTid);

  if (!response.ok) {
    const err = await response.text();
    console.error('[QuickBooks Refresh] Token refresh failed. intuit_tid:', intuitTid);
    throw new Error(`Token refresh failed: ${err}`);
  }

  return response.json();
}

/**
 * Create payment charge via QuickBooks Payments API
 */
export async function createPaymentCharge(
  accessToken: string,
  charge: PaymentCharge
): Promise<{ chargeId: string; status: string }> {
  const requestId = generateRequestId();
  const url = `${QB_BASE_URL}/quickbooks/v4/payments/charges`;

  const body: any = {
    amount: charge.amount.toFixed(2),
    currency: charge.currency || 'USD',
    description: charge.description,
    capture: true,
    context: {
      mobile: false,
      isEcommerce: true,
    },
  };

  // For sandbox testing, use test card data directly
  // Reference: https://developer.intuit.com/app/developer/qbpayments/docs/develop/sandboxes
  const isSandbox = import.meta.env.QUICKBOOKS_ENVIRONMENT !== 'production';
  
  if (isSandbox) {
    // Use test card data for sandbox
    body.card = {
      number: '4111111111111111', // Visa test card
      expMonth: '12',
      expYear: '2026',
      cvc: '123',
      name: charge.customer.name,
      address: {
        streetAddress: '123 Main St',
        city: 'Mountain View',
        region: 'CA',
        country: 'US',
        postalCode: '94043',
      },
    };
  } else if (charge.cardToken) {
    // Production: use token
    body.token = charge.cardToken;
  }

  console.log('[QuickBooks] Creating payment charge:', {
    url,
    amount: body.amount,
    currency: body.currency,
    requestId,
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Request-Id': requestId,
      },
      body: JSON.stringify(body),
    });

    // Log intuit_tid for debugging (Intuit recommendation)
    const intuitTid = response.headers.get('intuit_tid');
    console.log('[QuickBooks Payment] intuit_tid:', intuitTid, 'Request-Id:', requestId);

    if (!response.ok) {
      const err = await response.text();
      console.error('[QuickBooks] Payment charge failed:', {
        status: response.status,
        statusText: response.statusText,
        error: err,
        intuit_tid: intuitTid,
        request_id: requestId,
      });
      throw new Error(`Payment charge failed (${response.status}): ${err}`);
    }

    const data = await response.json();
    console.log('[QuickBooks] Payment charge created:', {
      chargeId: data.id,
      intuit_tid: intuitTid,
      request_id: requestId,
    });
    
    return {
      chargeId: data.id,
      status: data.status,
    };
  } catch (error: any) {
    console.error('[QuickBooks] Network error:', {
      message: error.message,
      code: error.code,
      cause: error.cause,
    });
    
    // Provide more helpful error messages
    if (error.code === 'ENOTFOUND') {
      throw new Error('Unable to connect to QuickBooks API. Please check your internet connection and firewall settings.');
    } else if (error.code === 'ETIMEDOUT') {
      throw new Error('QuickBooks API request timed out. Please try again.');
    }
    
    throw error;
  }
}

/**
 * Verify webhook signature from QuickBooks
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const secret = import.meta.env.QUICKBOOKS_WEBHOOK_SECRET;
  if (!secret) return false;

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const calculatedSignature = hmac.digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(calculatedSignature),
    Buffer.from(signature)
  );
}

// Helper functions
function generateRequestId(): string {
  return `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
}
