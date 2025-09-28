

export type ProductImage = {
  view: string;
  url: string;
};

export type ProductColor = {
  name: string;
  stock: number;
  images: ProductImage[];
};

export type Product = {
  id: string; // Firestore document ID
  slug: string; // URL-friendly identifier
  name: string;
  category: 'Hijab' | 'Turban' | 'Casquette' | 'Abaya' | 'Robe' | 'Ensemble';
  price: number;
  sizes: string[];  // Stored as an array in Firestore
  imageUrl: string; // Main/default product image used as a fallback or thumbnail
  colors: ProductColor[]; // The new structure as requested
  description: string;
  details?: string[]; // Stored as an array in Firestore
  dataAiHint?: string;
  isFeatured?: boolean;
  createdAt?: Date; // Firestore Timestamp will be converted to Date
  updatedAt?: Date; // Firestore Timestamp will be converted to Date
};

export type CartItem = {
  productId: string;
  name: string;
  slug: string; 
  price: number;
  quantity: number;
  imageUrl: string;
  color: string; // Color is mandatory for a cart item
  size?: string; // Size is optional
};

export type BlogPost = {
  id: string; // Firestore document ID
  slug: string;
  title: string;
  date: string; // Ou Firestore Timestamp converti en string/Date
  excerpt: string;
  content: string; // HTML content
  imageUrl: string;
  author: string;
  dataAiHint?: string;
  isPublished?: boolean;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
};

export type GalleryItem = {
  id: string;
  imageUrl: string;
  customerName: string;
  testimonial?: string; // Modifié de itemName à testimonial
  dataAiHint?: string;
  submittedAt?: Date;
  isApproved?: boolean;
};

export type FilterOptions = {
  categories: string[];
  colors: string[];
  sizes: string[];
  priceRange: [number, number];
};

// Updated to reflect the new input method
export type ProductFormData = {
  name: string;
  category: 'Hijab' | 'Turban' | 'Casquette';
  price: number;
  sizes: string;  // Comma-separated string of sizes
  imageUrl: string; // Main fallback/thumbnail image
  description: string;
  details?: string; // Newline-separated string of details
  dataAiHint?: string;
  isFeatured?: boolean;
  // A single field for a JSON string representing the entire colors array
  colorsData: string; 
};


export type ShippingAddress = {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode: string;
    country: string;
    phoneNumber?: string;
};

export type Order = {
  id: string;
  userId: string;
  items: {
    productId: string;
    name: string;
    quantity: number;
    priceAtPurchase: number;
    color: string;
    size?: string;
    imageUrl?: string;
  }[];
  totalAmount: number;
  shippingCost: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  orderDate: Date; // Changed to Date to be more robust
  shippingAddress?: ShippingAddress;
};

export type UserProfile = {
  uid: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  createdAt?: Date;
  updatedAt?: Date;
};


export type SiteSettings = {
  id: string; // 'general'
  siteName?: string;
  contactEmail?: string;
  phoneNumber?: string;
  address?: string;
  socialMediaLinks?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  };
  // ... autres paramètres
};

export type ShippingPolicy = {
  id: string;
  title: string;
  content: string; // HTML ou Markdown
  updatedAt: Date;
};

export type ReturnRequest = {
  id: string;
  orderId: string;
  userId: string;
  reason: string;
  requestedItems: { productId: string; quantity: number }[];
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  requestedAt: Date;
  adminNotes?: string;
};

// New type for AI-suggested products
export type SuggestedProduct = {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  category: string;
  slug: string;
};

// Type for AI Recommendation Flow
export interface StyleRecommendationOutput {
  recommendation: string;
  reasoning: string;
  suggestedProducts?: SuggestedProduct[];
}


// Analytics Types
export type ProductSales = {
  productId: string;
  name: string;
  quantitySold: number;
};

export type SalesAnalytics = {
  totalRevenue: number;
  revenueAmine: number;
  revenueMaryem: number;
  totalOrdersDelivered: number;
  totalItemsSold: number;
  totalCustomers: number; // New
  monthlySales: {
    [key: string]: { // key is 'YYYY-MM'
      revenue: number;
      orders: number;
    }
  };
  topSellingProducts: ProductSales[];
  lastUpdated: any; // Firestore Timestamp
};

export type CategoryWithImage = {
  name: string;
  imageUrl: string;
};
