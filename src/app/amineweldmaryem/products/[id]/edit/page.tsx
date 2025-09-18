
// src/app/amineweldmaryem/products/[id]/edit/page.tsx
import PageHeader from '@/components/shared/PageHeader';
import DynamicProductForm from '@/components/admin/DynamicProductForm';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getProductById } from '@/services/productService';
import { notFound } from 'next/navigation';

export const revalidate = 0; // Or a longer interval

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Modifier le Produit" 
          description={`Mise à jour des informations pour : ${product.name}`}
          className="text-left mb-0"
        />
        <Button variant="outline" asChild>
          <Link href="/amineweldmaryem/products">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste
          </Link>
        </Button>
      </div>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Détails du Produit</CardTitle>
          <CardDescription>
            Modifiez les champs ci-dessous et enregistrez les changements. Le slug n'est pas modifiable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DynamicProductForm product={product} />
        </CardContent>
      </Card>
    </div>
  );
}
