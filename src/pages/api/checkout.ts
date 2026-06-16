/**
 * Checkout API Endpoint
 * Processes payments via QuickBooks Payments
 */

import type { APIRoute } from 'astro';
import { createPaymentCharge } from '../../services/quickbooks.service';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!getApps().length) {
  const serviceAccount = JSON.parse(
    import.meta.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
  );
  
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { items, total, customer, payment } = body;

    console.log('[Checkout API] Processing order:', { total, customer: customer.email });

    // Validate request
    if (!items || !total || !customer || !payment) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get QuickBooks access token
    const accessToken = await getQuickBooksAccessToken();

    if (!accessToken) {
      console.error('[Checkout API] No QuickBooks access token available');
      return new Response(
        JSON.stringify({ 
          error: 'Payment system not configured. Please authorize QuickBooks at /admin/quickbooks/authorize' 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Checkout API] Access token obtained, length:', accessToken.length);

    // Create payment charge
    const chargeResult = await createPaymentCharge(accessToken, {
      amount: total,
      currency: 'USD',
      description: `Order - ${items.length} item(s)`,
      customer: {
        email: customer.email,
        name: customer.name,
      },
      cardToken: await tokenizeCard(payment),
    });

    console.log('[Checkout API] Payment charge created:', chargeResult.chargeId);

    // Create order in Firestore
    const orderRef = await db.collection('orders').add({
      items,
      total,
      customer,
      payment: {
        chargeId: chargeResult.chargeId,
        status: chargeResult.status,
        method: 'quickbooks',
      },
      status: 'paid',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('[Checkout API] Order created:', orderRef.id);

    // Send confirmation email (optional)
    // await sendOrderConfirmation(customer.email, orderRef.id);

    return new Response(
      JSON.stringify({
        success: true,
        orderId: orderRef.id,
        chargeId: chargeResult.chargeId,
        message: 'Payment processed successfully',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[Checkout API] Error:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Payment processing failed',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * Get QuickBooks access token
 * In production, this should retrieve and refresh tokens from database
 */
async function getQuickBooksAccessToken(): Promise<string | null> {
  try {
    console.log('[Checkout API] Fetching QuickBooks tokens from Firestore...');
    
    // Check if we have stored tokens in Firestore
    const tokensDoc = await db.collection('settings').doc('quickbooks_tokens').get();
    
    if (!tokensDoc.exists) {
      console.error('[Checkout API] No QuickBooks tokens found in Firestore.');
      console.error('[Checkout API] Please authorize QuickBooks at /admin/quickbooks/authorize');
      return null;
    }

    const tokens = tokensDoc.data();
    const now = Date.now();

    console.log('[Checkout API] Tokens found:', {
      hasAccessToken: !!tokens?.access_token,
      hasRefreshToken: !!tokens?.refresh_token,
      expiresAt: tokens?.expires_at ? new Date(tokens.expires_at).toISOString() : 'N/A',
      realmId: tokens?.realm_id,
      isExpired: tokens?.expires_at ? now >= tokens.expires_at : 'unknown'
    });

    // Check if token is expired
    if (tokens && tokens.expires_at && now < tokens.expires_at) {
      console.log('[Checkout API] Using existing access token (valid)');
      return tokens.access_token;
    }

    // Token expired, need to refresh
    console.log('[Checkout API] Token expired, refreshing...');
    
    if (!tokens?.refresh_token) {
      console.error('[Checkout API] No refresh token available. Please re-authorize QuickBooks.');
      return null;
    }

    const { refreshAccessToken } = await import('../../services/quickbooks.service');
    const newTokens = await refreshAccessToken(tokens.refresh_token);

    console.log('[Checkout API] Token refreshed successfully');

    // Store new tokens
    await db.collection('settings').doc('quickbooks_tokens').set({
      access_token: newTokens.access_token,
      refresh_token: newTokens.refresh_token,
      expires_at: now + (newTokens.expires_in * 1000),
      realm_id: tokens.realm_id, // Preserve realm_id
      updated_at: new Date(),
    });

    return newTokens.access_token;

  } catch (error: any) {
    console.error('[Checkout API] Error getting access token:', {
      message: error.message,
      stack: error.stack
    });
    return null;
  }
}

/**
 * Tokenize card using QuickBooks Payments
 * In production, this should be done client-side using QuickBooks.js
 */
async function tokenizeCard(payment: any): Promise<string> {
  // This is a placeholder. In production, you should:
  // 1. Use QuickBooks.js on the client to tokenize the card
  // 2. Send only the token to the server
  // 3. Never send raw card data to your server
  
  // For sandbox testing, you can use test card tokens
  // See: https://developer.intuit.com/app/developer/qbpayments/docs/develop/testing
  
  return 'test_card_token'; // Replace with actual token from client
}
