import * as admin from 'firebase-admin';

// This prevents initializing the app more than once.
const getFirebaseAdmin = () => {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  try {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    };
    
    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        throw new Error('Firebase Admin SDK credentials are not set in .env.local');
    }

    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
    // Re-throw the error to make it visible in the server logs
    throw error;
  }
};

const adminApp = getFirebaseAdmin();

export const adminAuth = adminApp.auth();
export const adminDb = adminApp.firestore();
