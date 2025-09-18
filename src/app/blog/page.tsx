import Link from 'next/link';
import Image from 'next/image';
import PageHeader from '@/components/shared/PageHeader';
import { getBlogPosts } from '@/services/blogService';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import type { BlogPost } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Blog - Conseils Hijab Style',
  description: 'Inspirez-vous avec nos articles sur les dernières tendances de la mode modeste, des conseils de style hijab et plus encore.',
};

// Revalidate data at most every hour
export const revalidate = 3600;

const POSTS_PER_PAGE = 9; // Number of posts to display initially

export default async function BlogPage() {
  // Fetch a limited number of recent blog posts
  const allBlogPosts: BlogPost[] = await getBlogPosts({ limit: POSTS_PER_PAGE });

  // Filter out posts that are not ready to be displayed publicly
  const blogPosts = allBlogPosts.filter(post => post.slug && post.title && post.isPublished);

  return (
    <div className="space-y-12">
      <PageHeader
        title="Conseils Hijab Style"
        description="Découvrez nos astuces, tendances et inspirations pour sublimer votre style modeste au quotidien."
      />
      {blogPosts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map(post => (
              <Card key={post.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
                <CardHeader className="p-0">
                  <Link href={`/blog/${post.slug}`} className="block">
                    <div className="aspect-video relative w-full">
                      <Image
                        src={(post.imageUrl && post.imageUrl.startsWith('http')) ? post.imageUrl : "https://placehold.co/800x500.png"}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-contain"
                        data-ai-hint={post.dataAiHint || 'blog fashion'}
                      />
                    </div>
                  </Link>
                </CardHeader>
                <CardContent className="p-6 flex-grow">
                  <p className="text-sm text-muted-foreground mb-1">
                    {new Date(post.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })} - Par {post.author}
                  </p>
                  <CardTitle className="text-xl mb-2">
                    <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                      {post.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed line-clamp-3">{post.excerpt}</CardDescription>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button asChild variant="outline" className="w-full sm:w-auto">
                    <Link href={`/blog/${post.slug}`}>
                      Lire la Suite <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          {/* TODO: Add pagination or a "Load More" button if more posts exist than POSTS_PER_PAGE */}
          {/* For example, if (await getBlogPostsCount()) > POSTS_PER_PAGE ... display button */}
        </>
      ) : (
        <p className="text-center text-muted-foreground py-12">Aucun article de blog pour le moment. Revenez bientôt !</p>
      )}
    </div>
  );
}
