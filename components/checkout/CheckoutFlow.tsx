// src/components/checkout/CheckoutFlow.tsx
'use client';

import { useState, useEffect } from 'react';
import type { UserProfile } from '@/lib/types';
import CheckoutForm, { type ShippingFormValues } from './CheckoutForm';
import CheckoutSummary from './CheckoutSummary';
import { updateUserProfile } from '@/services/userService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, runTransaction, collection, serverTimestamp, getDoc, type DocumentSnapshot, type DocumentData } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { Loader2, CheckCircle2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from 'next/link';

interface CheckoutFlowProps {
  userProfile: UserProfile;
}

export default function CheckoutFlow({ userProfile }: CheckoutFlowProps) {
  const [profile, setProfile] = useState(userProfile);
  const [isEditing, setIsEditing] = useState(!userProfile.fullName);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  
  const { items, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // If user profile is incomplete, force edit mode.
    if (!userProfile.fullName || !userProfile.addressLine1 || !userProfile.phoneNumber) {
      setIsEditing(true);
    }
  }, [userProfile]);

  const handleSaveProfile = async (data: ShippingFormValues) => {
    setIsSaving(true);
    try {
      await updateUserProfile(profile.uid, data);
      setProfile({ ...profile, ...data });
      setIsEditing(false);
      toast({
        title: "Succès",
        description: "Vos informations ont été enregistrées.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer vos informations.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
        toast({ title: "Panier Vide", description: "Veuillez ajouter des articles avant de commander.", variant: "destructive" });
        router.push('/products');
        return;
    }
    
    setIsProcessingOrder(true);
    toast({ title: "Traitement de la commande...", description: "Veuillez patienter." });

    try {
        // Generate a new order document reference *before* the transaction
        const newOrderRef = doc(collection(db, 'orders'));
        
        await runTransaction(db, async (transaction) => {
            const productDocsMap = new Map<string, DocumentSnapshot<DocumentData>>();

            // First, read all products and check stock within the transaction
            for (const item of items) {
                const productDocRef = doc(db, 'products', item.productId);
                const productSnap = await transaction.get(productDocRef);
                if (!productSnap.exists()) {
                    throw new Error(`Le produit "${item.name}" n'existe plus.`);
                }
                productDocsMap.set(item.productId, productSnap);

                const productData = productSnap?.data() as Product;
                const colorVariant = productData.colors.find(c => c.name === item.color);
                if (!colorVariant || colorVariant.stock < item.quantity) {
                    throw new Error(`Stock insuffisant pour "${item.name}" en couleur ${item.color}. Stock restant : ${colorVariant?.stock || 0}.`);
                }
            }
            
            // If all checks pass, create the order and update stock
            transaction.set(newOrderRef, {
                userId: profile.uid,
                items: items.map(({ productId, name, price, quantity, color, imageUrl }) => ({
                    productId, name, priceAtPurchase: price, quantity, color, imageUrl
                })),
                totalAmount: items.reduce((total, item) => total + item.price * item.quantity, 0),
                status: 'pending',
                orderDate: serverTimestamp(),
                shippingAddress: {
                    fullName: profile.fullName,
                    addressLine1: profile.addressLine1,
                    addressLine2: profile.addressLine2,
                    city: profile.city,
                    postalCode: profile.postalCode,
                    country: profile.country,
                    phoneNumber: profile.phoneNumber,
                },
            });

            // Now, update the stock for each product
            for (const item of items) {
                const productDocRef = doc(db, 'products', item.productId);
                const productSnap = productDocsMap.get(item.productId);
                const productData = productSnap?.data() as Product;
                const updatedColors = productData.colors.map(c => 
                    c.name === item.color ? { ...c, stock: c.stock - item.quantity } : c
                );
                transaction.update(productDocRef, { colors: updatedColors });
            }
        });

        clearCart();
        setIsOrderSuccess(true);

    } catch (error: any) {
        console.error("Erreur lors de la transaction de commande: ", error);
        toast({
            title: "Erreur de Commande",
            description: error.message || "Impossible de finaliser la commande. Veuillez vérifier le stock des articles.",
            variant: "destructive"
        });
    } finally {
        setIsProcessingOrder(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="lg:col-span-1">
        {isEditing ? (
          <CheckoutForm 
            userProfile={profile} 
            onSave={handleSaveProfile} 
            onCancel={() => setIsEditing(false)}
            isSaving={isSaving}
          />
        ) : (
          <CheckoutSummary 
            profile={profile} 
            onEdit={() => setIsEditing(true)} 
            onPlaceOrder={handlePlaceOrder}
            isProcessingOrder={isProcessingOrder}
          />
        )}
      </div>

      <AlertDialog open={isOrderSuccess} onOpenChange={setIsOrderSuccess}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              Commande passée avec succès !
            </AlertDialogTitle>
            <AlertDialogDescription>
              Merci pour votre confiance. Votre commande a été enregistrée et est en cours de traitement. Vous pouvez suivre son statut dans votre profil.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => router.push('/products')}>Continuer les achats</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Link href="/profile/orders">Voir mes commandes</Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
