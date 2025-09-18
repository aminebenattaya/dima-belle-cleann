

import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { getProducts } from '@/services/productService';
import type { Product } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import ProductTableActions from '@/components/admin/ProductTableActions';

// Revalidate data frequently for admin pages, or consider on-demand revalidation
export const revalidate = 0; // Revalidate on every request for admin

export default async function AdminProductsPage() {
  const products: Product[] = await getProducts();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <PageHeader title="Gestion des Produits" description="Ajoutez, modifiez ou supprimez des produits de votre catalogue." className="text-left mb-0"/>
        <Button asChild>
          <Link href="/amineweldmaryem/products/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un Produit
          </Link>
        </Button>
      </div>

      {products.length > 0 ? (
        <div className="bg-card p-6 rounded-lg shadow-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 hidden md:table-cell">Image</TableHead>
                <TableHead className="w-[40%]">Nom</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="hidden md:table-cell">
                    <Link href={`/products/${product.slug}`} target="_blank">
                      <div className="relative h-12 w-12 rounded-md overflow-hidden border">
                        <Image 
                          src={(product.imageUrl && product.imageUrl.startsWith('http')) ? product.imageUrl : "https://placehold.co/100x100.png"} 
                          alt={product.name} 
                          fill 
                          sizes="48px"
                          className="object-contain"
                          data-ai-hint={product.dataAiHint || "product image"}
                        />
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium align-top">
                     <div>
                        <Link href={`/products/${product.slug}`} target="_blank" className="hover:text-primary hover:underline" title="Voir le produit (public)">
                          {product.name}
                        </Link>
                      </div>
                      {product.dataAiHint && (
                        <p className="text-xs text-muted-foreground mt-1 truncate" title={product.dataAiHint}>
                          <span className="font-semibold">Indice IA:</span> {product.dataAiHint}
                        </p>
                      )}
                  </TableCell>
                  <TableCell className="align-top"><Badge variant="secondary">{product.category}</Badge></TableCell>
                  <TableCell className="align-top">{typeof product.price === 'number' ? `${product.price.toFixed(2)} DT` : 'N/A'}</TableCell>
                  <TableCell className="text-right align-top">
                    <ProductTableActions productId={product.id} productName={product.name} productSlug={product.slug} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="p-12 text-center border-2 border-dashed border-muted-foreground/30 rounded-lg bg-card">
          <p className="text-lg text-muted-foreground">Aucun produit trouvé dans le catalogue.</p>
          <p className="text-sm text-muted-foreground mt-2">Commencez par ajouter votre premier produit !</p>
        </div>
      )}
    </div>
  );
}
