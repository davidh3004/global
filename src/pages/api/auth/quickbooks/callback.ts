/**
 * QuickBooks OAuth Callback Handler
 * Receives the authorization code after user grants access
 */
import type { APIRoute } from 'astro';
import { getAccessToken } from '../../../../services/quickbooks.service';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../../../firebase/client';

export const GET: APIRoute = async ({ request, redirect }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const realmId = url.searchParams.get('realmId');
  const error = url.searchParams.get('error');

  if (error) {
    console.error('QuickBooks OAuth error:', error);
    return redirect('/admin/config?qb=error&msg=' + encodeURIComponent(error));
  }

  if (!code) {
    return new Response(JSON.stringify({ error: 'Missing authorization code' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const tokens = await getAccessToken(code);
    const now = Date.now();

    // Store tokens securely in Firestore (encrypted in production)
    await setDoc(doc(db, 'settings', 'quickbooks_tokens'), {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      expires_at: now + (tokens.expires_in * 1000), // Calculate expiration timestamp
      token_type: tokens.token_type,
      realm_id: realmId || '',
      updatedAt: Timestamp.now(),
    });

    console.log('QuickBooks connected successfully. Realm ID:', realmId);

    return redirect('/admin/quickbooks/authorize?success=true');
  } catch (err: any) {
    console.error('QuickBooks OAuth token exchange error:', err.message);
    return redirect('/admin/quickbooks/authorize?error=' + encodeURIComponent(err.message));
  }
};
