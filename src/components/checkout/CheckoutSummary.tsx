// src/components/checkout/CheckoutSummary.tsx
'use client';

import type { UserProfile } from '@/lib/types';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Home, Phone, User, Edit } from 'lucide-react';
import Image from 'next/image';

interface CheckoutSummaryProps {
  profile: UserProfile;
  onEdit: () => void;
  onPlaceOrder: () => void;
  isProcessingOrder: boolean;
}

const SHIPPING_COST = 8; // Frais de livraison fixes

export default function CheckoutSummary({ profile, onEdit, onPlaceOrder, isProcessingOrder }: CheckoutSummaryProps) {
  const { items } = useCart();
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalPrice = subtotal + SHIPPING_COST;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Vos Coordonnées</CardTitle>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="mr-2 h-3 w-3" /> Modifier
            </Button>
          </div>
          <CardDescription>
            Votre commande sera livrée à l'adresse suivante.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p className="flex items-center"><User className="mr-2 h-4 w-4 text-primary" />{profile.fullName}</p>
          <p className="flex items-start"><Home className="mr-2 h-4 w-4 text-primary mt-1" />
            <span>
              {profile.addressLine1}<br/>
              {profile.addressLine2 && <>{profile.addressLine2}<br/></>}
              {profile.postalCode} {profile.city}, {profile.country}
            </span>
          </p>
          <p className="flex items-center"><Phone className="mr-2 h-4 w-4 text-primary" />{profile.phoneNumber}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Résumé de la Commande</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map(item => (
              <div key={item.productId + item.color} className="flex items-center gap-4">
                <div className="relative h-16 w-16 rounded-md overflow-hidden border bg-muted/30">
                  <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-contain" />
                </div>
                <div className="flex-grow">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.color} - Qte: {item.quantity}</p>
                </div>
                <p className="font-medium">{(item.price * item.quantity).toFixed(2)} DT</p>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
           <div className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span>{subtotal.toFixed(2)} DT</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Frais de livraison</span>
                    <span>{SHIPPING_COST.toFixed(2)} DT</span>
                </div>
           </div>
          <Separator className="my-4" />
          <div className="flex justify-between font-bold text-lg">
            <p>Total</p>
            <p>{totalPrice.toFixed(2)} DT</p>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
            <Button size="lg" className="w-full" onClick={onPlaceOrder} disabled={isProcessingOrder || items.length === 0}>
                {isProcessingOrder ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Traitement...</>
                ) : (
                `Valider et Commander (${totalPrice.toFixed(2)} DT)`
                )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">Le paiement se fera à la livraison.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
