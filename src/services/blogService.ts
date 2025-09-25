// src/services/blogService.ts
import { db } from '@/lib/firebase';
import type { BlogPost } from '@/lib/types';
import { collection, getDocs, doc, getDoc, query, where, orderBy, limit as firestoreLimit, Timestamp, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

const BLOG_POSTS_COLLECTION = 'blogPosts';

const shapeBlogPost = (docSnap: any): BlogPost => {
    const data = docSnap.data();
    return {
        id: docSnap.id,
        slug: data.slug || '',
        ...data,
        date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : (data.date || new Date(0).toISOString()),
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : undefined,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : undefined,
    } as BlogPost;
}

export async function getBlogPosts(options?: { limit?: number }): Promise<BlogPost[]> {
  try {
    const blogPostsCollection = collection(db, BLOG_POSTS_COLLECTION);
    let q = query(blogPostsCollection, orderBy('date', 'desc'));

    if (options?.limit) {
      q = query(q, firestoreLimit(options.limit));
    }

    const blogPostSnapshot = await getDocs(q);
    return blogPostSnapshot.docs.map(shapeBlogPost);
  } catch (error) {
    console.error("Error fetching blog posts: ", error);
    return [];
  }
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  try {
    const blogPostDocRef = doc(db, BLOG_POSTS_COLLECTION, id);
    const blogPostSnap = await getDoc(blogPostDocRef);

    if (blogPostSnap.exists()) {
      return shapeBlogPost(blogPostSnap);
    } else {
      console.warn(`Blog post with ID ${id} not found.`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching blog post with ID ${id}: `, error);
    return null;
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const collectionRef = collection(db, BLOG_POSTS_COLLECTION);
    const q = query(collectionRef, where("slug", "==", slug), firestoreLimit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        console.warn(`Blog post with slug "${slug}" not found.`);
        return null;
    }
    
    return shapeBlogPost(querySnapshot.docs[0]);

  } catch (error) {
      console.error(`Error fetching blog post with slug ${slug}:`, error);
      return null;
  }
}

export async function getBlogPostsCount(): Promise<number> {
  try {
    const blogPostsCollection = collection(db, BLOG_POSTS_COLLECTION);
    // Assuming blog posts collection is publicly readable for counts.
    const blogPostSnapshot = await getDocs(blogPostsCollection);
    return blogPostSnapshot.size;
  } catch (error) {
    console.error("Error fetching blog posts count: ", error);
    return 0;
  }
}

export async function getAllBlogPostSlugs(): Promise<string[]> {
  try {
    const blogPostsCollection = collection(db, BLOG_POSTS_COLLECTION);
    const q = query(blogPostsCollection, where('isPublished', '==', true));
    const blogPostSnapshot = await getDocs(q);
    
    // Return the 'slug' field for each document, filtering out any that might be empty
    return blogPostSnapshot.docs.map(doc => doc.data().slug).filter(Boolean);
  } catch (error) {
    console.error("Error fetching all blog post slugs: ", error);
    return [];
  }
}
