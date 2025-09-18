
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/products/ProductCard';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { getFeaturedProducts, getNewArrivals } from '@/services/productService';
import type { Metadata } from 'next';
import type { Product } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Accueil',
  description: 'Bienvenue chez Dima Belle. Découvrez nos collections de foulards, turbans et prêt-à-porter modestes et élégants.',
};

// Revalidate data at most every hour (3600 seconds)
export const revalidate = 3600;

export default async function HomePage() {
  // Fetch featured products from Firestore
  const featuredProducts: Product[] = await getFeaturedProducts(4);
  // Fetch new arrivals from Firestore
  const newArrivals: Product[] = await getNewArrivals(3);


  return (
    <div className="space-y-16">
      {/* Hero Banner */}
      <section className="relative h-[50vh] md:h-[70vh] w-full rounded-lg overflow-hidden shadow-xl flex items-center justify-center bg-background">
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 15% 50%, hsl(var(--primary) / 0.05), transparent 30%),
              radial-gradient(circle at 85% 40%, hsl(var(--accent) / 0.05), transparent 30%),
              radial-gradient(circle at 50% 90%, hsl(var(--secondary) / 0.05), transparent 35%)
            `,
            backgroundColor: 'hsl(var(--background))'
          }}
        />
        <div className="relative text-center p-4 z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-4" style={{ fontFamily: 'var(--font-lora)' }}>
            Élégance & Modestie
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 mb-8 max-w-2xl">
            Découvrez nos créations uniques qui subliment la femme moderne avec raffinement.
          </p>
          <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/products">Explorer la Collection</Link>
          </Button>
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <PageHeader title="Nos Coups de Cœur" description="Une sélection de nos articles les plus appréciés, parfaits pour toutes les occasions." />
        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Aucun produit en vedette pour le moment. Revenez bientôt !</p>
        )}
        <div className="text-center mt-12">
          <Button size="lg" variant="outline" asChild>
            <Link href="/products">Voir Tous les Produits</Link>
          </Button>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="bg-muted/50 p-8 md:p-12 rounded-lg shadow-md">
         <PageHeader title="Nouveautés" description="Restez à la pointe de la mode avec nos dernières créations." />
        {newArrivals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {newArrivals.map(product => ( 
               <div key={product.id} className="bg-card p-4 rounded-md shadow-sm text-center">
                  <div className="relative h-64 w-full mb-3 rounded overflow-hidden">
                    <Image 
                      src={(product.imageUrl && product.imageUrl.startsWith('http')) ? product.imageUrl : "https://placehold.co/400x400.png"}
                      alt={product.name} 
                      fill 
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-contain" 
                      data-ai-hint={product.dataAiHint || "fashion item"}
                    />
                  </div>
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-sm text-accent">{typeof product.price === 'number' ? `${product.price.toFixed(2)} DT` : 'Prix non spécifié'}</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link href={`/products/${product.slug}`}>Découvrir</Link>
                  </Button>
               </div>
            ))}
          </div>
        ) : (
           <p className="text-center text-muted-foreground">Pas de nouveautés pour le moment. Revenez bientôt !</p>
        )}
      </section>
    </div>
  );
}
