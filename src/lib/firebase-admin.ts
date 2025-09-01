import * as admin from 'firebase-admin';
import 'dotenv/config';

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
};

function getFirebaseAdmin() {
  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (error) {
      console.error('Firebase admin initialization error', error);
    }
  }
  return admin;
}

export const adminAuth = getFirebaseAdmin().auth();
export const adminDb = getFirebaseAdmin().firestore();
