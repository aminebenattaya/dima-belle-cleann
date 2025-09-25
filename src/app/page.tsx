
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/products/ProductCard';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { getFeaturedProducts, getNewArrivals } from '@/services/productService';
import type { Metadata } from 'next';
import type { Product } from '@/lib/types';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Accueil',
  description: 'Bienvenue chez Dima Belle. Découvrez nos collections de foulards, turbans et prêt-à-porter modestes et élégants.',
};

export const revalidate = 3600;

export default async function HomePage() {
  const featuredProducts: Product[] = await getFeaturedProducts(4);
  const newArrivals: Product[] = await getNewArrivals(3);


  return (
    <div className="space-y-20">
      {/* Hero Banner */}
      <section className="relative h-[60vh] md:h-[75vh] w-full rounded-2xl overflow-hidden flex items-center justify-center text-center p-6 bg-card">
        <div className="absolute inset-0 w-full h-full">
            <Image 
                src="https://res.cloudinary.com/dqcxokqrv/image/upload/v1758809304/By_MYRiam_co._swvefr.jpg"
                alt="Dima Belle collection"
                fill
                className="object-cover"
                priority
            />
             <div 
              className="absolute inset-0 w-full h-full bg-gradient-to-t from-black/50 to-transparent"
            />
        </div>
        <div className="relative z-10 text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{ fontFamily: 'var(--font-lora)' }}>
            L'Élégance Redéfinie
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Découvrez nos créations uniques qui subliment la femme moderne avec raffinement et modestie.
          </p>
          <Button size="lg" asChild className="shadow-subtle hover:shadow-subtle-hover transition-shadow bg-white text-primary hover:bg-white/90">
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
      <section className="bg-card border p-8 md:p-12 rounded-2xl shadow-subtle">
         <PageHeader title="Nouveautés" description="Restez à la pointe de la mode avec nos dernières créations." />
        {newArrivals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {newArrivals.map(product => ( 
               <Link key={product.id} href={`/products/${product.slug}`} className="group block">
                <div className="overflow-hidden rounded-lg mb-4">
                  <div className="relative h-96 w-full">
                    <Image 
                      src={(product.imageUrl && product.imageUrl.startsWith('http')) ? product.imageUrl : "https://placehold.co/400x600.png"}
                      alt={product.name} 
                      fill 
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-contain transform group-hover:scale-105 transition-transform duration-500 ease-in-out" 
                      data-ai-hint={product.dataAiHint || "fashion item"}
                    />
                  </div>
                </div>
                <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">{product.name}</h3>
                <p className="text-sm text-accent font-semibold">{typeof product.price === 'number' ? `${product.price.toFixed(2)} DT` : 'Prix non spécifié'}</p>
                 <div className="flex items-center text-sm text-muted-foreground mt-2 group-hover:text-primary transition-colors">
                    <span>Découvrir</span>
                    <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                 </div>
               </Link>
            ))}
          </div>
        ) : (
           <p className="text-center text-muted-foreground">Pas de nouveautés pour le moment. Revenez bientôt !</p>
        )}
      </section>
    </div>
  );
}
