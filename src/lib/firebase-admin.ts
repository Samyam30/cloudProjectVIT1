import * as admin from 'firebase-admin';
import 'dotenv/config';

if (!admin.apps.length) {
  try {
    // Note: The `process.env` variables are sourced from .env.local
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
