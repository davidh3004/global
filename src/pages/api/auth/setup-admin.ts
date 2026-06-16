/**
 * API Endpoint: Setup initial admin user
 * POST /api/auth/setup-admin
 * Body: { email: string }
 * 
 * This endpoint sets the admin custom claim for a user by email.
 * Use it once to set up the first admin user.
 * In production, protect this endpoint or remove it after initial setup.
 */
import type { APIRoute } from 'astro';
import { adminAuth } from '../../../firebase/admin';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return new Response(JSON.stringify({ error: 'email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get user by email
    const user = await adminAuth.getUserByEmail(email);

    // Set admin custom claim
    await adminAuth.setCustomUserClaims(user.uid, { role: 'admin' });

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Admin role set for ${email} (uid: ${user.uid}). User must sign out and sign in again to get new token.`,
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
