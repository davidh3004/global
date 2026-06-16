/**
 * Payment Status Endpoint
 * Check the status of a payment for a given order
 */
import type { APIRoute } from 'astro';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase/client';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const orderId = url.searchParams.get('orderId');

  if (!orderId) {
    return new Response(JSON.stringify({ error: 'Missing orderId parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const orderDoc = await getDoc(doc(db, 'orders', orderId));

    if (!orderDoc.exists()) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const order = orderDoc.data();

    return new Response(JSON.stringify({
      orderId,
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus || 'pending',
      paymentId: order.paymentId || null,
      status: order.status,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
