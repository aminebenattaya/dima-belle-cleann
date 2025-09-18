// src/app/profile/wishlist/page.tsx
'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useRouter } from 'next/navigation';
import { useWishlist } from '@/hooks/useWishlist';
import { getProducts } from '@/services/productService';
import type { Product } from '@/lib/types';
import { Loader2, Heart, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ProductCard from '@/components/products/ProductCard';

export default function WishlistPage() {
    const { user, loading: authLoading, isUserLoggedIn } = useAuthStatus();
    const router = useRouter();
    const { wishlist, loading: wishlistLoading } = useWishlist();
    const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    useEffect(() => {
        if (!authLoading && !isUserLoggedIn) {
            router.replace('/login?redirect=/profile/wishlist');
            return;
        }

        if (!wishlistLoading && wishlist.length > 0) {
            setLoadingProducts(true);
            const fetchProducts = async () => {
                const allProducts = await getProducts();
                const filteredProducts = allProducts.filter(p => wishlist.includes(p.id));
                setWishlistProducts(filteredProducts);
                setLoadingProducts(false);
            };
            fetchProducts();
        } else if (!wishlistLoading && wishlist.length === 0) {
            setWishlistProducts([]);
            setLoadingProducts(false);
        }
    }, [user, authLoading, isUserLoggedIn, router, wishlist, wishlistLoading]);
    
    const isLoading = authLoading || wishlistLoading || loadingProducts;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Chargement de la wishlist...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <PageHeader 
                    title="Ma Wishlist" 
                    description="Retrouvez ici tous les articles que vous avez aimés."
                    className="text-left mb-0"
                />
                <Button variant="outline" asChild>
                    <Link href="/profile">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Retour au profil
                    </Link>
                </Button>
            </div>

            {wishlistProducts.length === 0 ? (
                <Card className="text-center py-12">
                     <CardHeader>
                        <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <CardTitle>Votre wishlist est vide</CardTitle>
                        <CardDescription>
                            Parcourez nos produits et cliquez sur le cœur pour les sauvegarder ici !
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/products">Découvrir les produits</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {wishlistProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}
