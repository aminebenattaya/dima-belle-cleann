
// src/app/products/[slug]/page.tsx
import { Suspense } from 'react';
import { getProductById, getAllProductIds, getProductBySlug } from '@/services/productService';
import { Loader2 } from 'lucide-react';
import ProductDetails from '@/components/products/ProductDetails';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

// This is the main export, a Server Component that fetches data and handles metadata
export default function ProductSlugPage({ params }: { params: { slug: string } }) {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground text-lg">Chargement du produit...</p>
            </div>
        }>
            <ProductDetails productSlug={params.slug} />
        </Suspense>
    )
}

// Generate metadata on the server
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) {
    return { title: 'Produit non trouvé' };
  }
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      images: [product.imageUrl || ''],
    },
  };
}

// Generate static paths at build time on the server
export async function generateStaticParams() {
  const productIds = await getAllProductIds();
  const products = await Promise.all(
      productIds.map(id => getProductById(id))
  );

  return products
      .filter((product): product is NonNullable<typeof product> => product !== null && !!product.slug)
      .map(product => ({
          slug: product.slug,
      }));
}
