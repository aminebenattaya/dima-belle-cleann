
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
  
  // Robust URL generation to prevent double prefixes
  const productUrl = product.slug.startsWith('/products/') 
    ? product.slug 
    : `/products/${product.slug}`;

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full rounded-lg group">
      <CardHeader className="p-0">
        <Link href={productUrl} className="block">
          <div className="aspect-[3/4] relative w-full overflow-hidden">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-contain group-hover:scale-105 transition-transform duration-300"
              data-ai-hint={product.dataAiHint || 'fashion clothing'}
            />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg mb-1">
          <Link href={productUrl} className="hover:text-primary transition-colors">
            {product.name}
          </Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground">{product.category}</p>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center">
        <p className="text-xl font-semibold text-accent">{typeof product.price === 'number' ? `${product.price.toFixed(2)} DT` : 'Prix non spécifié'}</p>
        <Button asChild variant="outline" size="sm">
          <Link href={productUrl}>
            <Eye className="mr-2 h-4 w-4" /> Voir
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
