
// src/app/amineweldmaryem/blog/[id]/edit/page.tsx
import { getBlogPostById } from '@/services/blogService';
import { notFound } from 'next/navigation';
import EditBlogPostClient from '@/components/admin/EditBlogPostClient';

export const revalidate = 0; // Or a longer interval if you prefer

// generateStaticParams is needed for static export compatibility,
// but we don't want to pre-render any specific edit pages.
// Returning an empty array achieves this.
export async function generateStaticParams() {
  return [];
}

interface EditBlogPostPageProps {
  params: {
    id: string;
  };
}

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const { id } = params;
  const post = await getBlogPostById(id);

  if (!post) {
    notFound();
  }

  return <EditBlogPostClient post={post} />;
}
