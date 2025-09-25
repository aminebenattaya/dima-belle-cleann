// src/components/checkout/CheckoutFlow.tsx
'use client';

import { useState, useEffect } from 'react';
import type { UserProfile, Order } from '@/lib/types';
import CheckoutForm, { type ShippingFormValues } from './CheckoutForm';
import CheckoutSummary from './CheckoutSummary';
import { updateUserProfile } from '@/services/userService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, type Timestamp } from 'firebase/firestore';
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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface CheckoutFlowProps {
  userProfile: UserProfile;
}

const SHIPPING_COST = 8; // Frais de livraison fixes

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

    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
    const finalTotal = subtotal + SHIPPING_COST;

    const orderPayload: Omit<Order, 'id' | 'orderDate'> & { orderDate: Timestamp } = {
        userId: profile.uid,
        items: items.map(({ productId, name, price, quantity, color, imageUrl }) => ({
            productId, name, priceAtPurchase: price, quantity, color, imageUrl
        })),
        totalAmount: finalTotal,
        shippingCost: SHIPPING_COST,
        status: 'pending',
        orderDate: serverTimestamp() as Timestamp,
        shippingAddress: {
            fullName: profile.fullName!,
            addressLine1: profile.addressLine1!,
            addressLine2: profile.addressLine2,
            city: profile.city!,
            postalCode: profile.postalCode!,
            country: profile.country!,
            phoneNumber: profile.phoneNumber!,
        },
    };

    try {
      // The transaction is simplified to only create the order.
      // Stock update will be handled by a Cloud Function triggered by this creation.
      await addDoc(collection(db, 'orders'), orderPayload);
      
      clearCart();
      setIsOrderSuccess(true);
      
    } catch (error: any) {
        console.error("Erreur lors de la création de la commande : ", error);
        toast({
            title: "Erreur de Commande",
            description: "Impossible de passer la commande pour le moment. Veuillez réessayer.",
            variant: "destructive"
        });
    } finally {
      setIsProcessingOrder(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
      <div className="lg:col-span-2">
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

      <div className="lg:col-span-1">
          <Card className="sticky top-24">
              <CardHeader>
                  <CardTitle>Votre Panier</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="space-y-4">
                      {items.map(item => (
                          <div key={item.productId + item.color} className="flex items-center gap-4 text-sm">
                               <p className="font-semibold">{item.quantity}x</p>
                               <div>
                                   <p>{item.name}</p>
                                   <p className="text-xs text-muted-foreground">{item.color}</p>
                               </div>
                               <p className="ml-auto font-medium">{(item.price * item.quantity).toFixed(2)} DT</p>
                          </div>
                      ))}
                  </div>
              </CardContent>
          </Card>
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
