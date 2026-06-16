/**
 * Payment Creation Endpoint
 * Creates a QuickBooks payment charge for a customer order
 */
import type { APIRoute } from 'astro';
import { createPaymentCharge, refreshAccessToken } from '../../../services/quickbooks.service';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../../firebase/client';

async function getStoredAccessToken(): Promise<string> {
  const tokenDoc = await getDoc(doc(db, 'siteConfig', 'quickbooks_tokens'));
  if (!tokenDoc.exists()) {
    throw new Error('QuickBooks not connected. Please complete OAuth setup in Admin > Configuration.');
  }

  const data = tokenDoc.data();
  const updatedAt = data.updatedAt?.toDate?.() || new Date(0);
  const expiresIn = data.expires_in || 3600;
  const isExpired = (Date.now() - updatedAt.getTime()) / 1000 > expiresIn - 300; // 5 min buffer

  if (isExpired && data.refresh_token) {
    // Refresh the token
    const newTokens = await refreshAccessToken(data.refresh_token);
    await setDoc(doc(db, 'siteConfig', 'quickbooks_tokens'), {
      ...data,
      access_token: newTokens.access_token,
      refresh_token: newTokens.refresh_token,
      expires_in: newTokens.expires_in,
      updatedAt: Timestamp.now(),
    });
    return newTokens.access_token;
  }

  return data.access_token;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { orderId, orderNumber, total, customerEmail, customerName } = body;

    if (!orderId || !total || !customerEmail || !customerName) {
      return new Response(JSON.stringify({ error: 'Missing required fields: orderId, total, customerEmail, customerName' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get fresh access token
    const accessToken = await getStoredAccessToken();

    // Create QuickBooks payment charge
    const payment = await createPaymentCharge(accessToken, {
      amount: total,
      currency: 'USD',
      description: `Order ${orderNumber || orderId}`,
      customer: {
        email: customerEmail,
        name: customerName,
      },
      cardToken: body.cardToken, // Payment.js token from frontend
    });

    // Update order with payment info
    const { updateDoc } = await import('firebase/firestore');
    await updateDoc(doc(db, 'orders', orderId), {
      paymentId: payment.chargeId,
      paymentStatus: payment.status === 'CAPTURED' ? 'paid' : 'pending',
      updatedAt: Timestamp.now(),
    });

    return new Response(JSON.stringify({
      success: true,
      chargeId: payment.chargeId,
      status: payment.status,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Payment creation error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Payment processing failed',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
