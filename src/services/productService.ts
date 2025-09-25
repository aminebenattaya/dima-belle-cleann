// src/services/productService.ts
import { db } from '@/lib/firebase';
import type { Product } from '@/lib/types';
import { 
  collection, getDocs, doc, getDoc, query, 
  limit as firestoreLimit, addDoc, Timestamp, 
  serverTimestamp, where, orderBy, documentId, updateDoc,
  deleteDoc,
  getCountFromServer,
  QueryConstraint // Import QueryConstraint
} from 'firebase/firestore';

const PRODUCTS_COLLECTION = 'products';

// Helper function to generate a URL-friendly slug
const generateSlug = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars except hyphens
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text


// Helper to ensure product data is consistently shaped
const shapeProduct = (docSnap: any): Product => {
    const data = docSnap.data();
    const name = data.name || 'Sans nom';
    
    const productSlug = data.slug || generateSlug(name);

    // Base product structure
    const product: Product = {
        id: docSnap.id,
        slug: productSlug,
        name: name,
        category: data.category || 'Non classé',
        price: typeof data.price === 'number' ? data.price : 0,
        sizes: Array.isArray(data.sizes) ? data.sizes : (typeof data.sizes === 'string' ? data.sizes.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
        imageUrl: data.imageUrl || '',
        description: data.description || '',
        details: Array.isArray(data.details) ? data.details : (typeof data.details === 'string' ? data.details.split('\n').map((s: string) => s.trim()).filter(Boolean) : []),
        dataAiHint: data.dataAiHint,
        isFeatured: data.isFeatured || false,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : undefined,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : undefined,
        colors: [], // Initialize as empty, to be populated below
    };
    
    // Populate colors from the 'colors' array if it exists and is valid
    if (Array.isArray(data.colors) && data.colors.length > 0 && typeof data.colors[0] === 'object') {
        product.colors = data.colors.map((c: any) => ({
            name: c.name || 'Standard',
            stock: typeof c.stock === 'number' ? c.stock : 10,
            images: Array.isArray(c.images) ? c.images : []
        }));
    }

    // Set a default fallback image if none is available after processing
    if (!product.imageUrl && product.colors.length > 0 && product.colors[0].images.length > 0) {
      const faceImage = product.colors[0].images.find((img: any) => img.view.toLowerCase() === 'face');
      product.imageUrl = faceImage ? faceImage.url : product.colors[0].images[0].url;
    } else if (!product.imageUrl) {
      product.imageUrl = "https://placehold.co/600x800.png";
    }

    return product;
};


export async function getProducts(filters?: {
  category?: string;
  color?: string;
  priceMin?: number;
  priceMax?: number;
  keywords?: string;
  limit?: number;
}): Promise<Product[]> {
  try {
    const productsCollectionRef = collection(db, PRODUCTS_COLLECTION);
    const queryConstraints: QueryConstraint[] = [];

    // --- Build Firestore query from filters ---
    if (filters) {
      if (filters.category && filters.category !== 'Tout') {
        queryConstraints.push(where('category', '==', filters.category));
      }
      if (typeof filters.priceMin === 'number' && !isNaN(filters.priceMin)) {
        queryConstraints.push(where('price', '>=', filters.priceMin));
      }
      if (typeof filters.priceMax === 'number' && !isNaN(filters.priceMax)) {
        queryConstraints.push(where('price', '<=', filters.priceMax));
      }
       if (filters.color && filters.color !== 'Tout') {
        // Firestore cannot query inside array of objects directly in a simple way.
        // This is a limitation. We will keep this filter client-side for now,
        // or a more complex data structure would be needed (e.g., a subcollection or a flat array of colors).
      }
      if (filters.keywords) {
         // Firestore doesn't support full-text search natively. 
         // For a simple keyword search on a single field, you could use inequality operators,
         // but a robust solution requires a third-party service like Algolia or Typesense.
         // We will keep this filtering client-side for now.
      }
    }
    
    // Default sorting
    queryConstraints.push(orderBy('price')); // Changed to price for default sort with price filter
    
    if (filters?.limit) {
      queryConstraints.push(firestoreLimit(filters.limit));
    }
    
    const q = query(productsCollectionRef, ...queryConstraints);
    const productSnapshot = await getDocs(q);
    let productList = productSnapshot.docs.map(shapeProduct);
    
    // --- Post-query filtering for complex cases (keywords, color) ---
    if (filters) {
        if (filters.color && filters.color !== 'Tout') {
            const filterColorLower = filters.color.toLowerCase();
            productList = productList.filter(p => 
              p.colors.some(c => c.name.toLowerCase().includes(filterColorLower))
            );
        }
        if (filters.keywords) {
            const keywordsLower = filters.keywords.toLowerCase().split(' ').filter(k => k.length > 1);
            if (keywordsLower.length > 0) {
              productList = productList.filter(p => {
                const nameLower = p.name.toLowerCase();
                const descriptionLower = p.description.toLowerCase();
                const categoryLower = p.category.toLowerCase();
                const dataAiHintLower = p.dataAiHint?.toLowerCase() || '';
                return keywordsLower.some(kw => 
                  nameLower.includes(kw) || 
                  descriptionLower.includes(kw) ||
                  categoryLower.includes(kw) ||
                  dataAiHintLower.includes(kw)
                );
              });
            }
        }
    }
    
    return productList;

  } catch (error) {
    console.error("Error fetching products with filters: ", error);
    // You might get an error here if you need to create a composite index in Firestore.
    // The error message in the console will usually provide a link to create it.
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const productDocRef = doc(db, PRODUCTS_COLLECTION, id);
    const productSnap = await getDoc(productDocRef);

    if (productSnap.exists()) {
      return shapeProduct(productSnap);
    } else {
      console.warn(`[productService] Product with ID ${id} not found.`);
      return null;
    }
  } catch (error) {
    console.error(`[productService] Error fetching product with ID ${id}: `, error);
    return null;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  console.log(`[productService] Fetching product by slug: ${slug}`);
  try {
    const q = query(collection(db, PRODUCTS_COLLECTION), where("slug", "==", slug), firestoreLimit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return shapeProduct(querySnapshot.docs[0]);
    } else {
      console.warn(`[productService] Product with slug ${slug} not found.`);
      return null;
    }
  } catch (error) {
    console.error(`[productService] Error fetching product with slug ${slug}: `, error);
    return null;
  }
}

export async function getFeaturedProducts(count: number = 4): Promise<Product[]> {
  try {
    const productsCollectionRef = collection(db, PRODUCTS_COLLECTION);
    let q = query(productsCollectionRef, where('isFeatured', '==', true), firestoreLimit(count));
    
    let productSnapshot = await getDocs(q);
    
    if (productSnapshot.empty && count > 0) {
        console.warn("[productService] No featured products found, falling back to latest products.");
        const fallbackQuery = query(productsCollectionRef, orderBy('createdAt', 'desc'), firestoreLimit(count));
        productSnapshot = await getDocs(fallbackQuery);
    }
    
    return productSnapshot.docs.map(shapeProduct);
  } catch (error) {
    console.error("Error fetching featured products: ", error);
    return [];
  }
}

export async function getNewArrivals(count: number = 3): Promise<Product[]> {
  try {
    const productsCollectionRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(productsCollectionRef, orderBy('createdAt', 'desc'), firestoreLimit(count));
    const productSnapshot = await getDocs(q);
    return productSnapshot.docs.map(shapeProduct);
  } catch (error) {
    console.error("Error fetching new arrivals: ", error);
    return [];
  }
}

export async function getRelatedProducts(categoryId: string, currentProductId: string, count: number = 3): Promise<Product[]> {
  try {
    const productsCollectionRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(
      productsCollectionRef, 
      where('category', '==', categoryId),
      where(documentId(), '!=', currentProductId), 
      orderBy(documentId()),
      firestoreLimit(count + 5)
    );
    const productSnapshot = await getDocs(q);
    
    return productSnapshot.docs
      .map(shapeProduct)
      .filter(p => p.id !== currentProductId)
      .slice(0, count);
  } catch (error) {
    console.error("Error fetching related products: ", error);
    return [];
  }
}

export async function getProductsCount(): Promise<number> {
  try {
    const productsCollection = collection(db, PRODUCTS_COLLECTION);
    const snapshot = await getCountFromServer(productsCollection);
    return snapshot.data().count;
  } catch (error) {
    console.error("Error fetching products count: ", error);
    return 0;
  }
}


export async function getAllProductIds(): Promise<string[]> {
  try {
    const productsCollectionRef = collection(db, PRODUCTS_COLLECTION);
    const productSnapshot = await getDocs(productsCollectionRef);
    return productSnapshot.docs.map(doc => doc.id).filter(Boolean); // Filter out any empty results
  } catch (error) {
    console.error("Error fetching all product IDs: ", error);
    return [];
  }
}

export async function getUniqueProductColors(): Promise<string[]> {
  try {
    const productsCollectionRef = collection(db, PRODUCTS_COLLECTION);
    const productSnapshot = await getDocs(productsCollectionRef);
    const allProducts = productSnapshot.docs.map(shapeProduct);
    
    const colorSet = new Set<string>();
    allProducts.forEach(product => {
      if(product.colors && Array.isArray(product.colors)) {
        product.colors.forEach(color => {
          if (color.name) {
            colorSet.add(color.name);
          }
        });
      }
    });

    return Array.from(colorSet).sort();
  } catch (error) {
    console.error("Error fetching unique product colors: ", error);
    return [];
  }
}

export async function getAllProductSlugs(): Promise<string[]> {
    try {
        const productsCollectionRef = collection(db, PRODUCTS_COLLECTION);
        const productSnapshot = await getDocs(productsCollectionRef);
        return productSnapshot.docs.map(doc => doc.data().slug).filter(Boolean);
    } catch (error) {
        console.error("Error fetching all product slugs: ", error);
        return [];
    }
}
