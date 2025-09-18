
// src/components/cart/CartView.tsx
'use client';

import { useCart } from '@/hooks/useCart';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export default function CartView() {
  const { items, removeItem, updateItemQuantity, clearCart } = useCart();
  const { toast } = useToast();
  
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleRemoveItem = (productId: string, color: string, name: string) => {
    removeItem(productId, color);
    toast({
      title: "Article Retiré",
      description: `${name} a été retiré de votre panier.`,
      variant: "destructive"
    });
  }
  
  const handleClearCart = () => {
    clearCart();
    toast({
      title: "Panier Vidé",
      description: "Tous les articles ont été retirés de votre panier.",
      variant: "destructive"
    });
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-muted-foreground/30 rounded-lg bg-card min-h-[300px]">
        <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold text-foreground mb-2">Votre panier est actuellement vide</h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Il semble que vous n'ayez pas encore ajouté d'articles. Parcourez nos collections pour trouver quelque chose que vous aimez !
        </p>
        <Button asChild size="lg">
          <Link href="/products">Explorer les produits</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid md:grid-cols-3 gap-12 items-start">
        <div className="md:col-span-2 bg-card p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Votre Panier ({totalItems} articles)</h2>
            <Button variant="outline" size="sm" onClick={handleClearCart}>
              <Trash2 className="mr-2 h-4 w-4" /> Vider le panier
            </Button>
          </div>
          <Separator />
          <div className="divide-y divide-border">
            {items.map((item) => (
              <div key={`${item.productId}-${item.color}`} className="flex items-center gap-4 py-4">
                <div className="relative h-24 w-24 rounded-md overflow-hidden border bg-muted/30">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="96px"
                    className="object-contain"
                  />
                </div>
                <div className="flex-grow">
                  <Link href={`/products/${item.slug}`} className="font-semibold hover:text-primary">{item.name}</Link>
                  <p className="text-sm text-muted-foreground">Couleur: {item.color}</p>
                  <p className="text-sm text-accent font-medium">{item.price.toFixed(2)} DT</p>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                          const newQuantity = parseInt(e.target.value, 10);
                          if (!isNaN(newQuantity)) {
                            updateItemQuantity(item.productId, item.color, newQuantity)
                          }
                      }}
                      className="w-16 h-9 text-center"
                      aria-label={`Quantité pour ${item.name}`}
                    />
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.productId, item.color, item.name)} aria-label={`Retirer ${item.name}`}>
                    <Trash2 className="h-5 w-5 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="md:col-span-1 bg-card p-6 rounded-lg shadow-md sticky top-24">
          <h3 className="text-xl font-semibold mb-4">Résumé de la commande</h3>
          <Separator className="mb-4" />
          <div className="space-y-2">
              <div className="flex justify-between">
                  <p className="text-muted-foreground">Sous-total</p>
                  <p className="font-medium">{totalPrice.toFixed(2)} DT</p>
              </div>
              <div className="flex justify-between">
                  <p className="text-muted-foreground">Livraison</p>
                  <p className="font-medium">Calculée à la caisse</p>
              </div>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between font-bold text-lg">
              <p>Total</p>
              <p>{totalPrice.toFixed(2)} DT</p>
          </div>
          <Button size="lg" className="w-full mt-6" asChild>
            <Link href="/checkout">
              Procéder au Paiement <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
