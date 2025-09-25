// src/services/wishlistService.ts
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const USERS_COLLECTION = 'users';

/**
 * Fetches the user's wishlist (an array of product IDs) from their profile.
 * @param uid The user's unique ID from Firebase Auth.
 * @returns An array of product IDs in the wishlist.
 */
export async function getUserWishlist(uid: string): Promise<string[]> {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      // Ensure 'wishlist' is an array, return empty array if not found
      return Array.isArray(data.wishlist) ? data.wishlist : [];
    }
    return [];
  } catch (error) {
    console.error(`Error fetching wishlist for user ${uid}:`, error);
    return [];
  }
}

/**
 * Updates the user's wishlist in Firestore.
 * This function overwrites the existing wishlist with the new one.
 * @param uid The user's unique ID.
 * @param newWishlist The new array of product IDs.
 */
export async function updateUserWishlist(uid: string, newWishlist: string[]): Promise<void> {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    // Use setDoc with merge to avoid overwriting other user profile fields
    await setDoc(userDocRef, { wishlist: newWishlist }, { merge: true });
  } catch (error) {
    console.error(`Error updating wishlist for user ${uid}:`, error);
    throw new Error('Failed to update wishlist');
  }
}
