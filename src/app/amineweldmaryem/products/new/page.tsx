// src/app/amineweldmaryem/products/new/page.tsx
import PageHeader from '@/components/shared/PageHeader';
import DynamicProductForm from '@/components/admin/DynamicProductForm'; // Changed import
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function NewProductPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Ajouter un Nouveau Produit" 
          description="Remplissez les informations ci-dessous pour ajouter un produit à votre catalogue." 
          className="text-left mb-0"
        />
        <Button variant="outline" asChild>
          <Link href="/amineweldmaryem/products">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste des produits
          </Link>
        </Button>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Détails du Produit</CardTitle>
          <CardDescription>
            Ajoutez dynamiquement des couleurs et des images pour chaque variante de produit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DynamicProductForm />
        </CardContent>
      </Card>
    </div>
  );
}
