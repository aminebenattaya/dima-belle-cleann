
// src/services/galleryService.ts
'use server';

import { db } from '@/lib/firebase';
import type { GalleryItem } from '@/lib/types';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit as firestoreLimit, 
  Timestamp, 
  where,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';

const GALLERY_ITEMS_COLLECTION = 'galleryItems';

export async function getGalleryItems(options?: { limit?: number }): Promise<GalleryItem[]> {
  try {
    const galleryItemsCollectionRef = collection(db, GALLERY_ITEMS_COLLECTION);
    
    const queryConstraints = [
      where('isApproved', '==', true), // Only fetch approved items
      orderBy('submittedAt', 'desc') // Order by submission date
    ];

    if (options?.limit) {
      queryConstraints.push(firestoreLimit(options.limit));
    }
    
    const q = query(galleryItemsCollectionRef, ...queryConstraints);
    
    const galleryItemSnapshot = await getDocs(q);
    return galleryItemSnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        submittedAt: data.submittedAt instanceof Timestamp ? data.submittedAt.toDate() : undefined,
        // isApproved will be part of data, ensure it's a boolean
        // testimonial will be part of data
      } as GalleryItem;
    });
  } catch (error) {
    console.error("Error fetching gallery items: ", error);
    // This error might be due to a missing Firestore index if you change queries.
    // Firestore will usually provide a link in the console to create the required index.
    return [];
  }
}

// Le type de 'data' est ajusté pour refléter le changement de itemName à testimonial
export async function addGalleryItemSubmission(
  data: { customerName: string; imageUrl: string; testimonial?: string }
): Promise<string | null> {
  try {
    const galleryItemsCollectionRef = collection(db, GALLERY_ITEMS_COLLECTION);
    const docRef = await addDoc(galleryItemsCollectionRef, {
      ...data, // customerName, imageUrl, testimonial
      isApproved: false, // Default to not approved
      submittedAt: serverTimestamp(), // Use Firestore server timestamp
      // dataAiHint could be added here or later by an admin/moderator
    });
    console.log("Gallery item submission added with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding gallery item submission: ", error);
    return null;
  }
}
