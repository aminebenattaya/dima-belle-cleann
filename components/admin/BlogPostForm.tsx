// src/components/admin/BlogPostForm.tsx
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { blogPostFormSchema, type BlogPostFormValues } from '@/lib/schemas';
import type { BlogPost } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

import { db } from '@/lib/firebase';
import { doc, addDoc, updateDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';

interface BlogPostFormProps {
  post?: BlogPost;
}

export default function BlogPostForm({ post }: BlogPostFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const isEditMode = !!post;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostFormSchema),
    defaultValues: {
      title: post?.title || '',
      slug: post?.slug || '',
      author: post?.author || '',
      date: post ? format(new Date(post.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      excerpt: post?.excerpt || '',
      content: post?.content || '',
      imageUrl: post?.imageUrl || '',
      dataAiHint: post?.dataAiHint || '',
      isPublished: post?.isPublished ?? true, // Set default
    },
  });

  const onSubmit: SubmitHandler<BlogPostFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      const dataToSave = {
        ...data,
        date: new Date(data.date).toISOString(), // Keep it as ISO string
        tags: [], // Placeholder for tags feature
      };

      if (isEditMode && post?.id) {
        // Update existing document
        const postDocRef = doc(db, 'blogPosts', post.id);
        await updateDoc(postDocRef, {
            ...dataToSave,
            updatedAt: serverTimestamp(),
        });
        toast({
          title: 'Succès',
          description: 'Article mis à jour avec succès !',
        });
      } else {
        // Create new document
        await addDoc(collection(db, 'blogPosts'), {
            ...dataToSave,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        toast({
          title: 'Succès',
          description: 'Article ajouté avec succès !',
        });
      }

      router.push('/amineweldmaryem/blog');
      // This forces a refresh of the page, re-fetching the data on the server component
      router.refresh(); 

    } catch (error: any) {
      console.error("Firestore error:", error);
      toast({
        title: 'Erreur Serveur',
        description: error.message || 'Impossible de contacter le serveur.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Titre de l'article</Label>
        <Input id="title" {...register('title')} />
        {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug (URL)</Label>
        <Input id="slug" {...register('slug')} placeholder="laissez-vide-pour-auto-generation" disabled={isEditMode} />
        <p className="text-xs text-muted-foreground mt-1">
          Sera utilisé dans l'URL. Ex: /blog/mon-super-article. Non modifiable après création.
        </p>
        {errors.slug && <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="author">Auteur</Label>
          <Input id="author" {...register('author')} />
          {errors.author && <p className="text-sm text-destructive mt-1">{errors.author.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date de publication</Label>
          <Input id="date" type="date" {...register('date')} />
          {errors.date && <p className="text-sm text-destructive mt-1">{errors.date.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Extrait</Label>
        <Textarea id="excerpt" {...register('excerpt')} rows={3} placeholder="Court résumé de l'article..." />
        {errors.excerpt && <p className="text-sm text-destructive mt-1">{errors.excerpt.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Contenu Principal (HTML supporté)</Label>
        <Textarea id="content" {...register('content')} rows={10} placeholder="Écrivez votre article ici..." />
        {errors.content && <p className="text-sm text-destructive mt-1">{errors.content.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="imageUrl">URL de l'image principale</Label>
          <Input id="imageUrl" type="url" {...register('imageUrl')} placeholder="https://example.com/image.jpg" />
          {errors.imageUrl && <p className="text-sm text-destructive mt-1">{errors.imageUrl.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="dataAiHint">Indice IA pour l'image (optionnel)</Label>
          <Input id="dataAiHint" {...register('dataAiHint')} placeholder="Ex: fashion blog" />
          {errors.dataAiHint && <p className="text-sm text-destructive mt-1">{errors.dataAiHint.message}</p>}
        </div>
      </div>
      
      <div className="pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditMode ? 'Enregistrer les modifications' : 'Publier l\'Article'}
        </Button>
      </div>
    </form>
  );
}
