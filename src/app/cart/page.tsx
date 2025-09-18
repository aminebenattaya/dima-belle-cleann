// src/app/cart/page.tsx
'use client';
import PageHeader from '@/components/shared/PageHeader';
import CartView from '@/components/cart/CartView';
import { Suspense } from 'react';

export default function CartPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Votre Panier"
        description="Vérifiez les articles de votre commande avant de passer à la caisse."
      />
      <Suspense fallback={<div className="text-center p-12">Chargement du panier...</div>}>
        <CartView />
      </Suspense>
    </div>
  );
}
