/**
 * API Endpoint: CRUD operations for users via firebase-admin
 * GET /api/auth/users - List all users
 * POST /api/auth/users - Create a new user
 * DELETE /api/auth/users?uid=xxx - Delete a user
 */
import type { APIRoute } from 'astro';
import { adminAuth } from '../../../firebase/admin';

export const GET: APIRoute = async () => {
  try {
    const listResult = await adminAuth.listUsers(1000);
    
    const users = listResult.users.map((user) => ({
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      disabled: user.disabled,
      emailVerified: user.emailVerified,
      role: user.customClaims?.role || 'customer',
      createdAt: user.metadata.creationTime,
      lastSignIn: user.metadata.lastSignInTime,
    }));

    return new Response(JSON.stringify({ users }), {
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

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, password, displayName, role = 'customer' } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'email and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: displayName || email.split('@')[0],
      emailVerified: false,
    });

    // Set custom claims for role
    await adminAuth.setCustomUserClaims(userRecord.uid, { role });

    return new Response(JSON.stringify({ 
      success: true, 
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        role,
      }
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const uid = url.searchParams.get('uid');

    if (!uid) {
      return new Response(JSON.stringify({ error: 'uid parameter is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await adminAuth.deleteUser(uid);

    return new Response(JSON.stringify({ success: true, uid }), {
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

export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { uid, email, displayName, password, disabled, role } = body;

    if (!uid) {
      return new Response(JSON.stringify({ error: 'uid is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build update object
    const updateData: any = {};
    if (email) updateData.email = email;
    if (displayName) updateData.displayName = displayName;
    if (password) updateData.password = password;
    if (typeof disabled === 'boolean') updateData.disabled = disabled;

    // Update user in Firebase Auth
    const userRecord = await adminAuth.updateUser(uid, updateData);

    // Update role if provided
    if (role && ['admin', 'customer'].includes(role)) {
      await adminAuth.setCustomUserClaims(uid, { role });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        disabled: userRecord.disabled,
        role: role || userRecord.customClaims?.role || 'customer',
      }
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
