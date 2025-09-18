
'use server';

import { adminDb } from '@/lib/firebase-admin';
import type { Order, Product } from '@/lib/types';
import { revalidatePath } from 'next/cache';

const ORDERS_COLLECTION = 'orders';
const PRODUCTS_COLLECTION = 'products';

/**
 * [Server Action - Admin Only] Deletes an order and restocks the items within a transaction.
 * @param orderId The ID of the order to delete.
 */
export async function deleteOrderAndRestockAction(orderId: string): Promise<{ success: boolean; message: string }> {
  if (!orderId) {
    return { success: false, message: "ID de commande manquant." };
  }

  const orderDocRef = adminDb.collection(ORDERS_COLLECTION).doc(orderId);

  try {
    await adminDb.runTransaction(async (transaction) => {
      const orderSnap = await transaction.get(orderDocRef);
      if (!orderSnap.exists) {
        throw new Error("La commande n'existe pas ou a déjà été supprimée.");
      }

      const orderData = orderSnap.data() as Omit<Order, 'id'>;
      
      // Do not restock items for orders that were already delivered
      if (orderData.status !== 'delivered') {
        for (const item of orderData.items) {
          const productDocRef = adminDb.collection(PRODUCTS_COLLECTION).doc(item.productId);
          const productSnap = await transaction.get(productDocRef);

          if (productSnap.exists) {
            const productData = productSnap.data() as Product;
            const updatedColors = productData.colors.map(color => {
              if (color.name === item.color) {
                return { ...color, stock: color.stock + item.quantity };
              }
              return color;
            });
            transaction.update(productDocRef, { colors: updatedColors });
          } else {
            console.warn(`[Action] Produit ${item.productId} non trouvé. Impossible de remettre en stock.`);
          }
        }
      } else {
        console.log(`[Action] Order ${orderId} was delivered. Deleting without restocking.`);
      }

      transaction.delete(orderDocRef);
    });

    revalidatePath('/amineweldmaryem/orders');
    return { success: true, message: `Commande #${orderId.substring(0,8).toUpperCase()} supprimée et stock mis à jour.` };

  } catch (error: any) {
    console.error(`[Action] La transaction de suppression pour la commande ${orderId} a échoué: `, error);
    return { success: false, message: error.message || "La suppression de la commande a échoué." };
  }
}
