
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText } from 'lucide-react';
import Link from 'next/link';
import { getBlogPosts } from '@/services/blogService';
import type { BlogPost } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BlogTableActions from '@/components/admin/BlogTableActions';

// Revalidate data at most every hour, or more frequently if needed
export const revalidate = 0; // Or 0 for full dynamic on every request for admin

export default async function AdminBlogPage() {
  const posts: BlogPost[] = await getBlogPosts();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Gestion des Articles de Blog" 
          description="Créez et gérez les contenus de votre Blog Style." 
          className="text-left mb-0"
        />
        <Button asChild>
          <Link href="/amineweldmaryem/blog/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Nouvel Article
          </Link>
        </Button>
      </div>

      {posts.length > 0 ? (
        <div className="bg-card p-6 rounded-lg shadow-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60%]">Titre</TableHead>
                <TableHead>Auteur</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">
                    <Link href={`/blog/${post.slug}`} target="_blank" className="hover:text-primary hover:underline" title="Voir l'article (public)">
                      {post.title || "(Sans titre)"} <FileText className="inline-block ml-1 h-3 w-3" />
                    </Link>
                  </TableCell>
                  <TableCell>{post.author}</TableCell>
                  <TableCell>{new Date(post.date).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell className="text-right">
                    <BlogTableActions postId={post.id} postTitle={post.title} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="p-12 text-center border-2 border-dashed border-muted-foreground/30 rounded-lg bg-card">
          <p className="text-lg text-muted-foreground">Aucun article de blog trouvé.</p>
          <p className="text-sm text-muted-foreground mt-2">Commencez par créer votre premier article !</p>
        </div>
      )}
    </div>
  );
}
