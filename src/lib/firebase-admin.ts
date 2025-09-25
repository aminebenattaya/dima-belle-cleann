// src/lib/firebase-admin.ts
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import serviceAccount from '../../firebase-admin.json';

// Ensure Firebase is only initialized once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`, // Activated for robust initialization
  });
}

const adminDb = getFirestore();
const adminAuth = getAuth();

export { adminDb, adminAuth };
