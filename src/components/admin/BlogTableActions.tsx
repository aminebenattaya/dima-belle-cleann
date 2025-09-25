// src/components/admin/BlogTableActions.tsx
'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
import { Edit3, Trash2, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';

interface BlogTableActionsProps {
  postId: string;
  postTitle: string;
}

export default function BlogTableActions({ postId, postTitle }: BlogTableActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'blogPosts', postId));
      toast({
        title: 'Succès',
        description: `Article "${postTitle}" supprimé.`,
      });
      router.refresh();
    } catch (error: any) {
      console.error("Error deleting blog post:", error);
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
      <Button variant="ghost" size="icon" asChild title="Modifier l'article">
        <Link href={`/amineweldmaryem/blog/${postId}/edit`}>
          <Edit3 className="h-4 w-4" />
        </Link>
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" disabled={isDeleting} title="Supprimer l'article">
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr(e) ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'article "{postTitle}" sera supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90" disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Oui, supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
