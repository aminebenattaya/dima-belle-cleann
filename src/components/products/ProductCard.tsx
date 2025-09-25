
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = (product.imageUrl && product.imageUrl.startsWith('http'))
    ? product.imageUrl
    : "https://placehold.co/600x800.png";
  
  const productUrl = product.slug.startsWith('/products/') 
    ? product.slug 
    : `/products/${product.slug}`;

  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col h-full rounded-lg group border">
      <CardHeader className="p-0 border-b">
        <Link href={productUrl} className="block overflow-hidden">
          <div className="aspect-[3/4] relative w-full bg-card">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-contain group-hover:scale-105 transition-transform duration-500 ease-in-out"
              data-ai-hint={product.dataAiHint || 'fashion clothing'}
            />
             <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button asChild variant="secondary" size="sm" className="w-full">
                    <div className="flex items-center justify-center">
                        <Eye className="mr-2 h-4 w-4" /> Voir le produit
                    </div>
                </Button>
            </div>
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{product.category}</p>
        <CardTitle className="text-base font-medium leading-tight mt-1 mb-2 flex-grow">
          <Link href={productUrl} className="hover:text-primary transition-colors">
            {product.name}
          </Link>
        </CardTitle>
        <p className="text-lg font-semibold text-accent">{typeof product.price === 'number' ? `${product.price.toFixed(2)} DT` : 'Prix non spécifié'}</p>
      </CardContent>
    </Card>
  );
}
