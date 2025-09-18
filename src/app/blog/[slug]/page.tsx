
import Image from 'next/image';
import { getBlogPostBySlug, getAllBlogPostSlugs } from '@/services/blogService'; // Updated import
import { notFound } from 'next/navigation';
import PageHeader from '@/components/shared/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Metadata, ResolvingMetadata } from 'next';
import type { BlogPost } from '@/lib/types';

type Props = {
  params: { slug: string };
};

// Revalidate data at most every hour
export const revalidate = 3600;

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug);
  if (!post) {
    return {
      title: 'Article non trouvé',
    };
  }
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
        images: [post.imageUrl || "https://placehold.co/800x500.png"],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto">
      <header className="mb-8">
        <PageHeader title={post.title} />
        <div className="text-center text-muted-foreground text-sm">
          <span>Publié le {new Date(post.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <span className="mx-2">|</span>
          <span>Par {post.author}</span>
        </div>
      </header>
      
      <div className="relative aspect-video w-full rounded-lg overflow-hidden shadow-lg mb-8">
        <Image
          src={(post.imageUrl && post.imageUrl.startsWith('http')) ? post.imageUrl : "https://placehold.co/800x500.png"}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-contain"
          data-ai-hint={post.dataAiHint || 'blog image'}
          priority
        />
      </div>

      <div 
        className="prose prose-lg max-w-none text-foreground/90 prose-headings:text-primary prose-strong:text-foreground prose-a:text-accent hover:prose-a:text-accent/80"
        dangerouslySetInnerHTML={{ __html: post.content }} 
      />

      <Separator className="my-12" />

      <footer className="text-center">
        <p className="text-muted-foreground">Merci d'avoir lu cet article Dima Belle !</p>
        {/* Share buttons placeholder */}
      </footer>
    </article>
  );
}

export async function generateStaticParams() {
  const slugs = await getAllBlogPostSlugs();
  // Limit pre-rendering if many posts, e.g. slugs.slice(0, 10)
  return slugs.map(slug => ({
    slug: slug,
  }));
}
