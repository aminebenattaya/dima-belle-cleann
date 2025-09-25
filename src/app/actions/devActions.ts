'use server';

import { adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import type { Order, Product } from '@/lib/types';

const ORDERS_COLLECTION = 'orders';
const PRODUCTS_COLLECTION = 'products';
const ANALYTICS_COLLECTION = 'salesAnalytics';
const SUMMARY_DOC_ID = 'summary';

/**
 * [Server Action - Admin Only] Deletes the sales analytics summary document.
 * This is useful for resetting calculations without deleting orders.
 */
export async function resetAnalyticsAction(): Promise<{ success: boolean; message: string }> {
  try {
    const analyticsDocRef = adminDb.collection(ANALYTICS_COLLECTION).doc(SUMMARY_DOC_ID);
    const analyticsSnap = await analyticsDocRef.get();
    
    if (analyticsSnap.exists) {
        await analyticsDocRef.delete();
    }

    revalidatePath('/amineweldmaryem/statistics');
    revalidatePath('/amineweldmaryem');

    return { 
        success: true, 
        message: "Les statistiques ont été réinitialisées. Les calculs reprendront à la prochaine commande livrée."
    };

  } catch (error: any) {
    console.error('[DevAction] La réinitialisation des statistiques a échoué: ', error);
    return { success: false, message: error.message || "La réinitialisation des statistiques a échoué." };
  }
}


/**
 * [Server Action - Admin Only] Deletes all orders and resets sales analytics.
 * This is a destructive operation and should only be used in a development/staging environment.
 */
export async function resetTestDataAction(): Promise<{ success: boolean; message: string }> {
  try {
    // Step 1: Delete all orders and restock products
    const ordersCollectionRef = adminDb.collection(ORDERS_COLLECTION);
    const ordersSnapshot = await ordersCollectionRef.get();

    if (!ordersSnapshot.empty) {
        const batch = adminDb.batch();
        const orderDocs = ordersSnapshot.docs;

        for (const orderDoc of orderDocs) {
            const orderData = orderDoc.data() as Omit<Order, 'id'>;

            // Restock items for non-delivered orders
            if (orderData.status !== 'delivered') {
                for (const item of orderData.items) {
                    const productDocRef = adminDb.collection(PRODUCTS_COLLECTION).doc(item.productId);
                    // We cannot perform reads in a batched write, so this has to be less safe.
                    // This is acceptable for a one-off dev script.
                    // For production, a transaction per order would be safer but much slower.
                    const productSnap = await productDocRef.get();
                     if (productSnap.exists()) {
                        const productData = productSnap.data() as Product;
                        const updatedColors = productData.colors.map(color => {
                          if (color.name === item.color) {
                            return { ...color, stock: color.stock + item.quantity };
                          }
                          return color;
                        });
                        batch.update(productDocRef, { colors: updatedColors });
                    }
                }
            }
             batch.delete(orderDoc);
        }
        await batch.commit();
    }
    
    // Step 2: Reset analytics document
    await resetAnalyticsAction();

    // Revalidate relevant paths
    revalidatePath('/amineweldmaryem/orders');
    revalidatePath('/amineweldmaryem/statistics');
    revalidatePath('/amineweldmaryem');

    return { 
        success: true, 
        message: `${ordersSnapshot.size} commandes supprimées et les statistiques ont été réinitialisées avec succès.` 
    };

  } catch (error: any) {
    console.error('[DevAction] La réinitialisation des données de test a échoué: ', error);
    return { success: false, message: error.message || "La réinitialisation des données a échoué." };
  }
}
