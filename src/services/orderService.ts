// src/services/orderService.ts

import { db } from '@/lib/firebase';
import type { Order, Product } from '@/lib/types';
import { collection, getDocs, doc, getDoc, query, where, orderBy, Timestamp, getCountFromServer, updateDoc, runTransaction } from 'firebase/firestore';
import { updateSalesAnalyticsOnDelivery, reverseSalesAnalyticsOnDeletion } from './statisticsService';

const ORDERS_COLLECTION = 'orders';
const PRODUCTS_COLLECTION = 'products';

const shapeOrder = (docSnap: any): Order => {
    const data = docSnap.data();
    return {
        id: docSnap.id,
        ...data,
        shippingCost: data.shippingCost || 0, // Assume 0 if not present
        orderDate: data.orderDate instanceof Timestamp 
            ? data.orderDate.toDate() 
            : new Date(data.orderDate || Date.now()),
    } as Order;
}

/**
 * [Admin Only] Fetches all orders from the database.
 * This function relies on Firestore security rules to ensure only admins can execute it.
 */
export async function getOrders(filters?: { status?: Order['status'][] }): Promise<Order[]> {
  try {
    const ordersCollection = collection(db, ORDERS_COLLECTION);
    
    const queryConstraints = [];
    if (filters?.status && filters.status.length > 0) {
        queryConstraints.push(where('status', 'in', filters.status));
    }
    queryConstraints.push(orderBy('orderDate', 'desc'));

    const q = query(ordersCollection, ...queryConstraints);
    const orderSnapshot = await getDocs(q);
    
    if (orderSnapshot.empty) {
        console.log("[orderService] No orders found with the specified criteria.");
        return [];
    }

    return orderSnapshot.docs.map(shapeOrder);

  } catch (error) {
    console.error("Error fetching all orders for admin: ", error);
    // This will likely be a PERMISSION_DENIED error if the rules are not set correctly.
    // The UI on the admin page should handle and display this error.
    throw new Error("Impossible de charger les commandes. Vérifiez les règles de sécurité Firestore.");
  }
}


// This function fetches orders for a SPECIFIC user.
export async function getOrdersForUser(userId: string): Promise<Order[]> {
    try {
        const ordersCollection = collection(db, ORDERS_COLLECTION);
        // This query requires that the user requesting it is either the user themselves, or an admin.
        const q = query(ordersCollection, where('userId', '==', userId), orderBy('orderDate', 'desc'));
        const orderSnapshot = await getDocs(q);
        return orderSnapshot.docs.map(shapeOrder);
    } catch (error) {
        console.error(`Error fetching orders for user ${userId}: `, error);
        return [];
    }
}

export async function getOrdersCount(): Promise<number> {
  try {
    const ordersCollection = collection(db, ORDERS_COLLECTION);
    // This requires an admin to have list/count permissions.
    const snapshot = await getCountFromServer(ordersCollection);
    return snapshot.data().count;
  } catch (error) {
    console.error("Error fetching orders count: ", error);
    return 0;
  }
}


export async function getOrderById(orderId: string): Promise<Order | null> {
    try {
        const orderDocRef = doc(db, ORDERS_COLLECTION, orderId);
        const orderSnap = await getDoc(orderDocRef);
        if (orderSnap.exists()) {
            return shapeOrder(orderSnap);
        }
        return null;
    } catch (error) {
        console.error("Error fetching order by id: ", error);
        return null;
    }
}

/**
 * [Admin Only] Updates the status of an order.
 * This function relies on Firestore security rules to ensure only admins can execute it.
 */
export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    try {
        const orderDocRef = doc(db, ORDERS_COLLECTION, orderId);
        
        // If the new status is 'delivered', we also update the sales analytics
        if (status === 'delivered') {
            const orderSnap = await getDoc(orderDocRef);
            if (orderSnap.exists()) {
                const orderData = shapeOrder(orderSnap);
                if (orderData.status !== 'delivered') {
                    // Call the analytics update function, which runs a transaction
                    await updateSalesAnalyticsOnDelivery(orderData);
                } else {
                    console.log(`Order ${orderId} is already delivered. No analytics update needed.`);
                    // Just update status if for some reason it's re-triggered
                    await updateDoc(orderDocRef, { status: status });
                }
            } else {
                throw new Error("Impossible de trouver la commande pour la mise à jour des statistiques.");
            }
        } else {
            // For any other status, just update the document
            await updateDoc(orderDocRef, { status: status });
        }
    } catch (error) {
        console.error(`Error updating status for order ${orderId}: `, error);
        throw new Error("Impossible de mettre à jour le statut de la commande.");
    }
}


/**
 * [DEPRECATED - Use Server Action instead] Deletes an order and restocks the items within a transaction.
 * @param orderId The ID of the order to delete.
 */
export async function deleteOrderAndRestock(orderId: string): Promise<void> {
  const orderDocRef = doc(db, ORDERS_COLLECTION, orderId);

  try {
    await runTransaction(db, async (transaction) => {
      const orderSnap = await transaction.get(orderDocRef);
      if (!orderSnap.exists()) {
        throw new Error("La commande n'existe pas ou a déjà été supprimée.");
      }

      const order = shapeOrder(orderSnap);
      
      // If the order was already delivered, we need to reverse the analytics calculation.
      if (order.status === 'delivered') {
         await reverseSalesAnalyticsOnDeletion(order, transaction);
      }

      // For ANY order that is NOT delivered, we restock the items.
      if (order.status !== 'delivered') {
          // For each item in the order, get the product and update its stock
          for (const item of order.items) {
            const productDocRef = doc(db, PRODUCTS_COLLECTION, item.productId);
            const productSnap = await transaction.get(productDocRef);

            if (productSnap.exists()) {
              const productData = productSnap.data() as Product;
              const updatedColors = productData.colors.map(color => {
                if (color.name === item.color) {
                  return { ...color, stock: color.stock + item.quantity };
                }
                return color;
              });
              transaction.update(productDocRef, { colors: updatedColors });
            } else {
              console.warn(`Produit ${item.productId} non trouvé. Impossible de remettre en stock.`);
            }
          }
      }

      // After updating all product stocks and potentially reversing analytics, delete the order document
      transaction.delete(orderDocRef);
    });
    console.log(`Commande ${orderId} supprimée et actions correspondantes effectuées.`);
  } catch (error) {
    console.error(`La transaction de suppression pour la commande ${orderId} a échoué: `, error);
    throw new Error("La suppression de la commande et la mise à jour du stock ont échoué.");
  }
}
