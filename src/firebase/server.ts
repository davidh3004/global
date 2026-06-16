/**
 * Firebase Server SDK - For server-side Firestore operations
 * Used in API routes and server-side rendering
 */
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin if not already initialized
if (getApps().length === 0) {
  const serviceAccountKey = import.meta.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  if (!serviceAccountKey) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_KEY is not set in environment variables. ' +
      'Please add it to your .env file.'
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

  initializeApp({
    credential: cert(serviceAccount),
  });
}

// Export Firestore instance for server-side use
export const db = getFirestore();
