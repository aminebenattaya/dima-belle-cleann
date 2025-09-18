
// src/app/amineweldmaryem/blog/new/page.tsx
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import BlogPostForm from '@/components/admin/BlogPostForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function NewBlogPostPage() {

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Créer un Nouvel Article" 
          description="Rédigez et publiez un nouvel article pour votre blog." 
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
                Remplissez tous les champs pour créer votre article de blog. Le slug (utilisé dans l'URL) sera généré automatiquement à partir du titre si laissé vide. Il ne pourra plus être modifié.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <BlogPostForm />
        </CardContent>
      </Card>
    </div>
  );
}
