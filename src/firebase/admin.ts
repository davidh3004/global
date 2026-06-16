/**
 * Firebase Admin SDK - Server-side only
 * Used for managing users, custom claims, and admin operations
 */
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let adminApp: App;

function getAdminApp(): App {
  if (getApps().length === 0) {
    const serviceAccountKey = import.meta.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (!serviceAccountKey) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT_KEY is not set in environment variables. ' +
        'Please add it to your .env file. See .env.example for details.'
      );
    }

    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountKey);
    } catch (error) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON. ' +
        'Make sure to stringify the entire service account JSON object.'
      );
    }

    // Validate required fields
    if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
      throw new Error(
        'Invalid service account: missing required fields (project_id, private_key, client_email). ' +
        'Please ensure you copied the complete service account JSON from Firebase Console.'
      );
    }

    adminApp = initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    adminApp = getApps()[0];
  }

  return adminApp;
}

export const adminAuth = getAuth(getAdminApp());
