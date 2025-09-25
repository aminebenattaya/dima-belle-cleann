
// src/services/userService.ts

import { db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';
import { doc, getDoc, setDoc, serverTimestamp, collection, getCountFromServer } from 'firebase/firestore';

const USERS_COLLECTION = 'users';

/**
 * Fetches a user's profile from Firestore.
 * @param uid The user's unique ID from Firebase Auth.
 * @returns The user profile object or null if not found.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        uid: userSnap.id,
        email: data.email,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country,
      } as UserProfile;
    } else {
      console.log(`No profile found for user ${uid}. This is expected for new users.`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching user profile for UID ${uid}:`, error);
    return null;
  }
}

/**
 * Creates or updates an existing user's profile in Firestore.
 * This function is robust and handles both new and existing profiles.
 * @param uid The user's unique ID.
 * @param data The partial data to update or create.
 */
export async function updateUserProfile(uid: string, data: Partial<Omit<UserProfile, 'uid'>>): Promise<void> {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    
    // Check if it's a new user by checking for the 'createdAt' field
    const userSnap = await getDoc(userDocRef);
    const updateData: Partial<UserProfile> & { updatedAt: any; createdAt?: any } = {
      ...data,
      updatedAt: serverTimestamp(),
    };
    
    if (!userSnap.exists()) {
        updateData.createdAt = serverTimestamp();
    }
    
    // Use setDoc with { merge: true } to create or update.
    await setDoc(userDocRef, updateData, { merge: true });
    
    console.log(`User profile created/updated for UID: ${uid}`);
  } catch (error) {
    console.error(`Error updating user profile for UID ${uid}:`, error);
    throw error;
  }
}

/**
 * [Admin Only] Fetches the total number of registered users.
 */
export async function getUsersCount(): Promise<number> {
  try {
    const usersCollection = collection(db, USERS_COLLECTION);
    const snapshot = await getCountFromServer(usersCollection);
    return snapshot.data().count;
  } catch (error) {
    console.error("Error fetching users count:", error);
    return 0;
  }
}
