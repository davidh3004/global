/**
 * API Endpoint: Set Custom Claims for a user
 * Uses firebase-admin to set role claims (admin/customer)
 * POST /api/auth/claims
 * Body: { uid: string, role: 'admin' | 'customer' }
 */
import type { APIRoute } from 'astro';
import { adminAuth } from '../../../firebase/admin';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { uid, role } = body;

    if (!uid || !role) {
      return new Response(JSON.stringify({ error: 'uid and role are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!['admin', 'customer'].includes(role)) {
      return new Response(JSON.stringify({ error: 'role must be admin or customer' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Set custom claims
    await adminAuth.setCustomUserClaims(uid, { role });

    return new Response(JSON.stringify({ success: true, uid, role }), {
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
