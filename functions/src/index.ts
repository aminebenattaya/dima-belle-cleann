/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import type { Order, Product } from "../../src/lib/types";


// Initialize Firebase Admin SDK if not already initialized
if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

/**
 * Cloud Function that triggers when a new order is created.
 * It updates the stock for each product in the order.
 */
export const onOrderCreated = onDocumentCreated("orders/{orderId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    logger.log("No data associated with the event");
    return;
  }

  const order = snapshot.data() as Omit<Order, "id">;
  logger.log(`New order received: ${snapshot.id}. Processing stock updates...`);

  const batch = db.batch();

  for (const item of order.items) {
    const productRef = db.collection("products").doc(item.productId);

    try {
        const productDoc = await productRef.get();
        if (!productDoc.exists) {
            logger.warn(`Product with ID ${item.productId} not found. Skipping stock update for this item.`);
            continue;
        }

        const product = productDoc.data() as Product;
        const colors = product.colors.map((color) => {
            if (color.name === item.color) {
                // Decrement stock, ensuring it doesn't go below zero
                const newStock = Math.max(0, color.stock - item.quantity);
                return { ...color, stock: newStock };
            }
            return color;
        });

        // Add the update operation to the batch
        batch.update(productRef, { colors });
        logger.log(`Scheduled stock update for product ${item.productId}, color ${item.color}.`);

    } catch (error) {
        logger.error(`Failed to process item ${item.productId} for order ${snapshot.id}`, error);
        // Continue to next item even if one fails
    }
  }

  // Commit all the batched writes at once
  try {
    await batch.commit();
    logger.log(`Successfully updated stock for all items in order ${snapshot.id}.`);
  } catch (error) {
    logger.error(`Failed to commit stock updates for order ${snapshot.id}`, error);
  }
});
