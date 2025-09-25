// src/components/products/ProductDetails.tsx
'use client'; // This directive marks the component as a Client Component

import * as React from 'react';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProductBySlug, getRelatedProducts } from '@/services/productService';
import { Loader2, ShoppingCart, Heart, Frown, CheckCircle2, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/shared/PageHeader';
import ProductCard from '@/components/products/ProductCard';
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
import { useCart } from '@/hooks/useCart';
import { useToast } from "@/hooks/use-toast";
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useWishlist } from '@/hooks/useWishlist';
import { cn } from '@/lib/utils';
import type { Product, ProductColor } from '@/lib/types';

export default function ProductDetails({ productSlug }: { productSlug: string }) {
  const [product, setProduct] = React.useState<Product | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [relatedProducts, setRelatedProducts] = React.useState<Product[]>([]);
  const [selectedColor, setSelectedColor] = React.useState<ProductColor | null>(null);
  const [activeImageUrl, setActiveImageUrl] = React.useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [quantity, setQuantity] = React.useState(1);

  const router = useRouter();
  
  const { addItem } = useCart();
  const { toast } = useToast();
  const { user, isUserLoggedIn } = useAuthStatus();
  const { wishlist, toggleWishlistItem, isToggling } = useWishlist();

  const isInWishlist = React.useMemo(() => {
    return product ? wishlist.includes(product.id) : false;
  }, [wishlist, product]);

  React.useEffect(() => {
    const fetchProductData = async () => {
      if (!productSlug) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const fetchedProduct = await getProductBySlug(productSlug);
        
        if (fetchedProduct) {
          setProduct(fetchedProduct);
          
          const defaultColor = (fetchedProduct.colors && fetchedProduct.colors.length > 0)
            ? fetchedProduct.colors.find(c => c.stock > 0) || fetchedProduct.colors[0]
            : null;
          
          setSelectedColor(defaultColor);
          
          if (defaultColor && defaultColor.images.length > 0) {
            const faceImage = defaultColor.images.find(img => img.view.toLowerCase() === 'face');
            setActiveImageUrl(faceImage ? faceImage.url : defaultColor.images[0].url);
          } else {
            setActiveImageUrl(fetchedProduct.imageUrl);
          }

          if (fetchedProduct.category && fetchedProduct.id) {
            const fetchedRelated = await getRelatedProducts(fetchedProduct.category, fetchedProduct.id, 3);
            setRelatedProducts(fetchedRelated);
          }
        } else {
          setProduct(null); // Explicitly set to null if not found
        }
      } catch (e) {
        console.error("Failed to fetch product:", e);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, [productSlug]);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground text-lg">Chargement du produit...</p>
      </div>
    );
  }

  if (!product) {
    notFound();
    return null;
  }

  const handleColorSelection = (color: ProductColor) => {
    setSelectedColor(color);
    if (color.images.length > 0) {
        const faceImage = color.images.find(img => img.view.toLowerCase() === 'face');
        setActiveImageUrl(faceImage ? faceImage.url : color.images[0].url);
    } else {
        setActiveImageUrl(product.imageUrl);
    }
    setQuantity(1); // Reset quantity on color change
  };
  
  const handleAddToCart = () => {
    if (!isUserLoggedIn) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour ajouter des articles au panier et passer une commande.",
        variant: "destructive",
        action: (
          <Button variant="secondary" size="sm" onClick={() => router.push('/login?redirect=' + window.location.pathname)}>
            Se connecter
          </Button>
        ),
      });
      return;
    }

    if (product && selectedColor) {
        addItem({
          productId: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          imageUrl: activeImageUrl || product.imageUrl,
          color: selectedColor.name,
        }, quantity);
        setIsDialogOpen(true);
    } else if (product && (!product.colors || product.colors.length === 0)) {
        addItem({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          imageUrl: activeImageUrl || product.imageUrl,
          color: 'Standard',
        }, quantity);
        setIsDialogOpen(true);
    }
    else {
        toast({
            title: "Sélection Requise",
            description: "Veuillez sélectionner une couleur avant d'ajouter l'article au panier.",
            variant: "destructive",
        });
    }
  };

  const handleWishlistToggle = async () => {
    if (!isUserLoggedIn) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour gérer votre wishlist.",
        variant: "destructive",
        action: (
          <Button variant="secondary" size="sm" onClick={() => router.push('/login?redirect=' + window.location.pathname)}>
            Se connecter
          </Button>
        ),
      });
      return;
    }
    if (product) {
      await toggleWishlistItem(product.id);
      toast({
        title: isInWishlist ? "Retiré de la wishlist" : "Ajouté à la wishlist",
        description: `${product.name} a été ${isInWishlist ? 'retiré de votre' : 'ajouté à votre'} wishlist.`,
      });
    }
  };
  
  const displayImageUrl = (activeImageUrl && (activeImageUrl.startsWith('http') || activeImageUrl.startsWith('data:'))) 
    ? activeImageUrl 
    : "https://placehold.co/600x800.png";
    
  const displayableDetails: string[] = product.details || [];
  const displayableSizes: string[] = product.sizes || [];

  const availableImages = selectedColor?.images || [];
  const isSelectedColorOutOfStock = selectedColor?.stock === 0;
  const isOutOfStock = product.colors && product.colors.length > 0 ? isSelectedColorOutOfStock : false;
  const maxQuantity = selectedColor?.stock || 99;

  const handleQuantityChange = (change: number) => {
    setQuantity(prev => {
        const newQuantity = prev + change;
        if (newQuantity < 1) return 1;
        if (newQuantity > maxQuantity) return maxQuantity;
        return newQuantity;
    });
  }

  return (
    <div className="space-y-16">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-start">
        <div className="flex flex-col gap-4 md:sticky top-24">
          <div className="aspect-square md:aspect-[3/4] relative w-full rounded-xl overflow-hidden border bg-card shadow-subtle">
            <Image
              src={displayImageUrl}
              alt={product.name + (selectedColor ? ` - ${selectedColor.name}` : '')}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain transition-opacity duration-300 ease-in-out"
              data-ai-hint={product.dataAiHint || 'fashion product'}
              priority
              key={displayImageUrl}
            />
          </div>
          {availableImages.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {availableImages.map((image, index) => (
                <button
                  key={`${image.url}-${index}`}
                  onClick={() => setActiveImageUrl(image.url)}
                  className={cn(
                    "aspect-square relative rounded-lg overflow-hidden border-2 transition-all bg-card",
                    activeImageUrl === image.url ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-transparent hover:border-muted-foreground/50'
                  )}
                  title={`Voir la vue ${image.view}`}
                >
                  <Image
                    src={(image.url && (image.url.startsWith('http') || image.url.startsWith('data:'))) ? image.url : "https://placehold.co/100x100.png"}
                    alt={`${product.name} - vue ${image.view}`}
                    fill
                    sizes="80px"
                    className="object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Badge variant="secondary" className="px-3 py-1 text-sm">{product.category}</Badge>
          <h1 className="text-3xl lg:text-4xl font-bold text-primary">{product.name}</h1>
          <p className="text-3xl font-semibold text-accent">
            {typeof product.price === 'number' ? product.price.toFixed(2) : 'Prix non disponible'} DT
          </p>
          
          <div className="text-base text-muted-foreground prose prose-sm max-w-none leading-relaxed">
            {product.description && <p>{product.description}</p>}
          </div>

          {product.colors && product.colors.length > 0 && (
            <div>
              <h3 className="text-md font-semibold mb-3">Couleurs : <span className="text-muted-foreground font-normal">{selectedColor?.name}</span></h3>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color, index) => (
                    <Button
                      key={`${color.name}-${index}`}
                      variant={'outline'}
                      size="sm"
                      onClick={() => handleColorSelection(color)}
                      className={cn(
                        "px-4 py-2 text-sm rounded-lg transition-all transform hover:scale-105",
                        {
                          "ring-2 ring-primary ring-offset-2": selectedColor?.name === color.name,
                          "ring-1 ring-destructive/50 text-destructive-foreground opacity-60 line-through": color.stock === 0,
                        }
                      )}
                      title={color.stock === 0 ? "Épuisé" : `${color.stock} en stock`}
                      disabled={color.stock === 0}
                    >
                      {color.name}
                    </Button>
                ))}
              </div>
            </div>
          )}

          {displayableSizes.length > 0 && (
            <div>
              <h3 className="text-md font-semibold mb-2 mt-4">Tailles:</h3>
              <div className="flex flex-wrap gap-2">
                {displayableSizes.map((size, index) => (
                   <Badge key={`${size}-${index}`} variant="outline" className="px-3 py-1 text-sm">{size}</Badge>
                ))}
              </div>
            </div>
          )}

            <div className="pt-6 space-y-4">
              {selectedColor && (
                  <div className={cn(
                      "text-sm p-3 rounded-lg font-medium text-center",
                      isSelectedColorOutOfStock ? "bg-destructive/10 text-destructive" : "bg-green-600/10 text-green-700"
                  )}>
                      {isSelectedColorOutOfStock 
                          ? <p>Cet article est actuellement en rupture de stock.</p>
                          : selectedColor.stock <= 5 
                              ? <p>Stock faible ! Plus que {selectedColor.stock} articles disponibles.</p>
                              : <p>En stock</p>
                      }
                  </div>
              )}
              <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                          <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                          type="number"
                          className="w-16 h-10 text-center text-lg font-bold"
                          value={quantity}
                          onChange={(e) => {
                              let val = parseInt(e.target.value, 10);
                              if (isNaN(val) || val < 1) val = 1;
                              if (val > maxQuantity) val = maxQuantity;
                              setQuantity(val);
                          }}
                          min="1"
                          max={maxQuantity}
                      />
                      <Button variant="outline" size="icon" onClick={() => handleQuantityChange(1)} disabled={quantity >= maxQuantity}>
                          <Plus className="h-4 w-4" />
                      </Button>
                  </div>
                  <Button size="lg" className="flex-grow shadow-subtle hover:shadow-subtle-hover transition-shadow" disabled={isOutOfStock} onClick={handleAddToCart}>
                      {isOutOfStock ? (
                          <><Frown className="mr-2 h-5 w-5" /> Épuisé</>
                      ) : (
                          <><ShoppingCart className="mr-2 h-5 w-5" /> Ajouter au Panier</>
                      )}
                  </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                  <Button size="lg" variant="outline" className="w-full" onClick={handleWishlistToggle} disabled={isToggling}>
                    {isToggling ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Heart className={cn("mr-2 h-5 w-5", isInWishlist && "fill-destructive text-destructive")} />
                    )}
                    {isInWishlist ? 'Dans la Wishlist' : 'Ajouter à la Wishlist'}
                  </Button>
              </div>
            </div>
             {displayableDetails.length > 0 && (
              <div className="pt-4">
                <h3 className="text-md font-semibold mt-4 mb-2 text-foreground">Détails :</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {displayableDetails.map((detail, index) => (
                     <li key={index}>{detail}</li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t">
          <PageHeader title="Vous aimerez aussi" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {relatedProducts.map(relatedProd => (
              <ProductCard key={relatedProd.id} product={relatedProd} />
            ))}
          </div>
        </section>
      )}

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              Ajouté au panier avec succès !
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                {product && (
                  <div className="flex items-center gap-4 mt-4">
                    <div className="relative h-24 w-24 rounded-lg overflow-hidden border bg-muted">
                      <Image
                        src={displayImageUrl}
                        alt={product.name}
                        fill
                        sizes="96px"
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{product.name}</p>
                      {selectedColor && <p className="text-sm text-muted-foreground">Couleur: {selectedColor.name}</p>}
                      <p className="text-sm text-muted-foreground">Quantité: {quantity}</p>
                      <p className="text-sm text-muted-foreground">Prix: {typeof product.price === 'number' ? (product.price * quantity).toFixed(2) : 'N/A'} DT</p>
                    </div>
                  </div>
                )}
                <p className="mt-4">Que souhaitez-vous faire maintenant ?</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuer les achats</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Link href="/cart">Voir mon panier</Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
