// src/services/statisticsService.ts

import { db } from '@/lib/firebase';
import type { Order, SalesAnalytics, ProductSales } from '@/lib/types';
import { doc, runTransaction, getDoc, serverTimestamp, FieldValue, increment, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { getUsersCount } from './userService';

const ANALYTICS_COLLECTION = 'salesAnalytics';
const SUMMARY_DOC_ID = 'summary';
const DELIVERY_FEE = 7; // 7 DT per order

/**
 * [Admin Only] Retrieves the sales analytics summary document.
 */
export async function getSalesAnalytics(): Promise<SalesAnalytics | null> {
    try {
        const analyticsDocRef = doc(db, ANALYTICS_COLLECTION, SUMMARY_DOC_ID);
        const docSnap = await getDoc(analyticsDocRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            // Sort top selling products by quantitySold descending
            if (data.topSellingProducts) {
                data.topSellingProducts.sort((a: ProductSales, b: ProductSales) => b.quantitySold - a.quantitySold);
            }
            return data as SalesAnalytics;
        }
        console.log("Analytics document does not exist yet. It will be created on the first delivered order.");
        return null; // No analytics created yet
    } catch (error) {
        console.error("Error fetching sales analytics:", error);
        throw new Error("Impossible de récupérer les données d'analyse.");
    }
}

/**
 * [Server-side only] Updates sales analytics and order status in a single transaction.
 * This is called when an order is marked as 'delivered'.
 * @param order The full order object that has been delivered.
 */
export async function updateSalesAnalyticsOnDelivery(order: Order): Promise<void> {
    const analyticsDocRef = doc(db, ANALYTICS_COLLECTION, SUMMARY_DOC_ID);
    const orderDocRef = doc(db, 'orders', order.id);

    try {
        await runTransaction(db, async (transaction) => {
            const analyticsSnap = await transaction.get(analyticsDocRef);
            let currentAnalytics: Partial<SalesAnalytics> = analyticsSnap.exists() ? analyticsSnap.data() : {};

            // Get total users count, which will be the most up-to-date
            const totalCustomers = await getUsersCount();

            // 1. Update total revenue and order count
            const totalRevenue = (currentAnalytics.totalRevenue || 0) + order.totalAmount;
            const totalOrdersDelivered = (currentAnalytics.totalOrdersDelivered || 0) + 1;
            const totalItemsSold = (currentAnalytics.totalItemsSold || 0) + order.items.reduce((sum, item) => sum + item.quantity, 0);

            // 2. Calculate new shared revenue based on this order
            const orderRevenueForSharing = order.totalAmount > DELIVERY_FEE ? order.totalAmount - DELIVERY_FEE : 0;
            const amineShare = orderRevenueForSharing * 0.05;
            const maryemShare = orderRevenueForSharing * 0.95;

            const revenueAmine = (currentAnalytics.revenueAmine || 0) + amineShare;
            const revenueMaryem = (currentAnalytics.revenueMaryem || 0) + maryemShare;


            // 3. Update monthly sales
            const monthKey = format(new Date(), 'yyyy-MM');
            const monthlySales = currentAnalytics.monthlySales || {};
            const currentMonthData = monthlySales[monthKey] || { revenue: 0, orders: 0 };
            monthlySales[monthKey] = {
                revenue: currentMonthData.revenue + order.totalAmount,
                orders: currentMonthData.orders + 1,
            };

            // 4. Update top-selling products
            const topSellingProducts: ProductSales[] = currentAnalytics.topSellingProducts || [];
            order.items.forEach(item => {
                const productIndex = topSellingProducts.findIndex(p => p.productId === item.productId);
                if (productIndex > -1) {
                    topSellingProducts[productIndex].quantitySold += item.quantity;
                } else {
                    topSellingProducts.push({
                        productId: item.productId,
                        name: item.name,
                        quantitySold: item.quantity,
                    });
                }
            });
            // Keep the list sorted and trimmed for performance
            topSellingProducts.sort((a, b) => b.quantitySold - a.quantitySold);
            const trimmedTopProducts = topSellingProducts.slice(0, 100); // Store top 100 products

            const updatedAnalyticsData = { 
                totalRevenue,
                revenueAmine,
                revenueMaryem,
                totalOrdersDelivered,
                totalItemsSold,
                totalCustomers, // Add total customers to the document
                monthlySales,
                topSellingProducts: trimmedTopProducts,
                lastUpdated: serverTimestamp(),
            };

            // Perform the transactional writes
            if (analyticsSnap.exists()) {
                transaction.update(analyticsDocRef, updatedAnalyticsData);
            } else {
                transaction.set(analyticsDocRef, updatedAnalyticsData);
            }
            
            // Finally, update the order status to 'delivered'
            transaction.update(orderDocRef, { status: 'delivered' });
        });
        console.log(`Successfully updated analytics for delivered order ${order.id}`);
    } catch (error) {
        console.error("Transaction failed: ", error);
        throw new Error("La mise à jour des statistiques a échoué.");
    }
}
