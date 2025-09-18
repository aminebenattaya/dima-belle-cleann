
// src/app/products/page.tsx
import PageHeader from '@/components/shared/PageHeader';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import ProductView from '@/components/products/ProductView';

// Helper for the suspense fallback skeleton
function ProductsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      <aside className="md:col-span-1">
        <Card className="shadow-lg rounded-lg sticky top-24">
          <CardContent className="p-4">
            <Skeleton className="h-[500px] w-full" />
          </CardContent>
        </Card>
      </aside>
      <main className="md:col-span-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden shadow-lg flex flex-col h-full rounded-lg">
              <Skeleton className="aspect-[3/4] w-full" />
              <CardContent className="p-4 flex-grow">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
              <CardFooter className="p-4 flex justify-between items-center">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-8 w-1/4" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="space-y-12">
      <PageHeader
        title="Notre Collection"
        description="Parcourez notre gamme complète de hijabs, turbans et casquettes. Utilisez les filtres pour trouver votre pièce parfaite."
      />
      {/* Suspense est nécessaire car ProductView utilise useSearchParams */}
      <Suspense fallback={<ProductsLoadingSkeleton />}>
        <ProductView />
      </Suspense>
    </div>
  );
}
