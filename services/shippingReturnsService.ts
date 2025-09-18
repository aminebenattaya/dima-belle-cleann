
// src/services/shippingReturnsService.ts
'use server';

import { db } from '@/lib/firebase';
import type { ShippingPolicy, ReturnRequest } from '@/lib/types';
import { collection, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore';

const SHIPPING_POLICIES_COLLECTION = 'shippingPolicies';
const RETURN_REQUESTS_COLLECTION = 'returnRequests';

const shapeShippingPolicy = (docSnap: any): ShippingPolicy => {
    const data = docSnap.data();
    return {
        id: docSnap.id,
        title: data.title || 'Sans titre',
        content: data.content || '',
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
    };
};

export async function getShippingPolicies(): Promise<ShippingPolicy[]> {
  try {
    const shippingCollection = collection(db, SHIPPING_POLICIES_COLLECTION);
    const snapshot = await getDocs(shippingCollection);
    return snapshot.docs.map(shapeShippingPolicy);
  } catch (error) {
    console.error("Error fetching shipping policies: ", error);
    return [];
  }
}

export async function getShippingPolicy(id: string): Promise<ShippingPolicy | null> {
    try {
        const docRef = doc(db, SHIPPING_POLICIES_COLLECTION, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return shapeShippingPolicy(docSnap);
        }
        return null;
    } catch (error) {
        console.error(`Error fetching shipping policy with ID ${id}: `, error);
        return null;
    }
}

export async function getReturnRequests(): Promise<ReturnRequest[]> {
  try {
    const returnsCollection = collection(db, RETURN_REQUESTS_COLLECTION);
    const snapshot = await getDocs(returnsCollection);
    return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        requestedAt: doc.data().requestedAt.toDate(),
    })) as ReturnRequest[];
  } catch (error)
    {
    console.error("Error fetching return requests: ", error);
    return [];
  }
}
