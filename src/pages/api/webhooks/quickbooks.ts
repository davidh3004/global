/**
 * QuickBooks Webhook Handler
 * Receives payment notifications from QuickBooks
 */
import type { APIRoute } from 'astro';
import { verifyWebhookSignature } from '../../../services/quickbooks.service';
import { collection, query, where, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../../../firebase/client';

export const POST: APIRoute = async ({ request }) => {
  const signature = request.headers.get('intuit-signature');
  const payload = await request.text();

  // Verify webhook signature
  if (!signature || !verifyWebhookSignature(payload, signature)) {
    console.warn('QuickBooks webhook: Invalid signature');
    return new Response('Invalid signature', { status: 401 });
  }

  try {
    const event = JSON.parse(payload);

    // Handle different event types
    for (const notification of event.eventNotifications || []) {
      for (const entity of notification.dataChangeEvent?.entities || []) {
        if (entity.name === 'Payment' && entity.operation === 'Create') {
          await handlePaymentEvent(entity.id, 'paid');
        } else if (entity.name === 'Payment' && entity.operation === 'Void') {
          await handlePaymentEvent(entity.id, 'refunded');
        }
      }
    }

    return new Response('OK', { status: 200 });
  } catch (error: any) {
    console.error('QuickBooks webhook processing error:', error);
    return new Response('Internal error', { status: 500 });
  }
};

async function handlePaymentEvent(paymentId: string, newStatus: string) {
  // Find order with this payment ID
  const q = query(collection(db, 'orders'), where('paymentId', '==', paymentId));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.warn(`No order found for payment ID: ${paymentId}`);
    return;
  }

  for (const orderDoc of snapshot.docs) {
    const updates: any = {
      paymentStatus: newStatus,
      updatedAt: Timestamp.now(),
    };

    if (newStatus === 'paid') {
      updates.status = 'processing';
    } else if (newStatus === 'refunded') {
      updates.status = 'cancelled';
    }

    await updateDoc(doc(db, 'orders', orderDoc.id), updates);
    console.log(`Order ${orderDoc.id} updated: paymentStatus=${newStatus}`);
  }
}
