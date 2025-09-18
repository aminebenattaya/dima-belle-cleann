
// src/components/admin/ProductTableActions.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Edit3, Trash2, Eye, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';


interface ProductTableActionsProps {
  productId: string;
  productName: string;
  productSlug: string;
}

export default function ProductTableActions({ productId, productName, productSlug }: ProductTableActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
        const productDocRef = doc(db, 'products', productId);
        await deleteDoc(productDocRef);
        toast({
            title: 'Succès',
            description: `Produit "${productName}" supprimé avec succès.`,
        });
        router.refresh();
    } catch (error: any) {
        console.error("Error deleting product:", error);
        toast({
            title: 'Erreur',
            description: error.message || "Une erreur est survenue lors de la suppression.",
            variant: 'destructive',
        });
    } finally {
        setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-0.5 sm:gap-1">
      <Button variant="ghost" size="icon" asChild title="Voir le produit (public)">
        <Link href={`/products/${productSlug}`} target="_blank">
            <Eye className="h-4 w-4" />
        </Link>
      </Button>
      <Button variant="ghost" size="icon" asChild title="Modifier le produit">
        <Link href={`/amineweldmaryem/products/${productId}/edit`}>
            <Edit3 className="h-4 w-4" />
        </Link>
      </Button>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" disabled={isDeleting} title="Supprimer le produit">
            {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous absolument sûr(e) ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le produit "{productName}" sera définitivement supprimé de votre base de données.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90" disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Oui, supprimer le produit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
