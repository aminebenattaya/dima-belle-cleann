
// src/components/admin/EditBlogPostClient.tsx
'use client';

import type { BlogPost } from '@/lib/types';
import PageHeader from '@/components/shared/PageHeader';
import BlogPostForm from '@/components/admin/BlogPostForm';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface EditBlogPostClientProps {
  post: BlogPost;
}

export default function EditBlogPostClient({ post }: EditBlogPostClientProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Modifier l'Article" 
          description={`Mise à jour de : ${post.title}`}
          className="text-left mb-0"
        />
        <Button variant="outline" asChild>
          <Link href="/amineweldmaryem/blog">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste
          </Link>
        </Button>
      </div>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Détails de l'Article</CardTitle>
          <CardDescription>
            Modifiez les champs ci-dessous et enregistrez les changements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BlogPostForm post={post} />
        </CardContent>
      </Card>
    </div>
  );
}
