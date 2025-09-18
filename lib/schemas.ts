// src/lib/schemas.ts
import { z } from 'zod';

// Helper function to generate a URL-friendly slug
const generateSlug = (text: string) => 
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[àáâäæãåāăą]/g, "a")
    .replace(/[çćč]/g, "c")
    .replace(/[èéêëēėę]/g, "e")
    .replace(/[îïíīįì]/g, "i")
    .replace(/[ñń]/g, "n")
    .replace(/[ôöòóœøōõ]/g, "o")
    .replace(/[šś]/g, "s")
    .replace(/[ûüùúū]/g, "u")
    .replace(/[ýÿ]/g, "y")
    .replace(/[^\w\s-]/g, '') // Remove all non-word, non-space, non-hyphen chars
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/-+/g, '-'); // Collapse dashes

// --- Product Schemas ---

// Schema for the dynamic product form
const imageSchema = z.object({
  view: z.string().min(1, "La vue est requise."),
  url: z.string().url("URL de l'image invalide.").min(1, "L'URL de l'image est requise."),
});

const colorSchemaDynamic = z.object({
  name: z.string().min(1, "Le nom de la couleur est requis."),
  stock: z.number().min(0, "Le stock doit être un nombre positif ou nul."),
  images: z.array(imageSchema).min(1, "Au moins une image est requise par couleur."),
});

export const addProductFormSchema = z.object({
  productName: z.string().min(3, "Le nom du produit doit avoir au moins 3 caractères."),
  slug: z.string().optional(),
  description: z.string().min(10, "La description doit avoir au moins 10 caractères."),
  category: z.enum(['Hijab', 'Turban', 'Casquette', 'Abaya', 'Robe', 'Ensemble'], {
    required_error: "La catégorie est requise.",
  }),
  price: z.number().positive("Le prix doit être un nombre positif."),
  colors: z.array(colorSchemaDynamic).min(1, "Au moins une couleur est requise."),
  sizes: z.string().min(1, "Au moins une taille est requise (ex: Taille Unique)."),
  details: z.string().optional(),
  isFeatured: z.boolean().default(false),
  dataAiHint: z.string().optional(),
}).transform(data => {
    if (!data.slug) {
        data.slug = generateSlug(data.productName);
    }
    return data;
});


export type AddProductFormValues = z.infer<typeof addProductFormSchema>;


// --- Blog Post Schema ---

export const blogPostFormSchema = z.object({
  title: z.string().min(5, "Le titre doit comporter au moins 5 caractères."),
  slug: z.string().optional().refine(s => !s || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s), "Le slug ne doit contenir que des lettres minuscules, des chiffres et des tirets."),
  author: z.string().min(2, "Le nom de l'auteur est requis."),
  date: z.string().refine((d) => !isNaN(Date.parse(d)), "La date de publication est invalide."),
  excerpt: z.string().min(20, "L'extrait doit comporter au moins 20 caractères.").max(200, "L'extrait ne doit pas dépasser 200 caractères."),
  content: z.string().min(50, "Le contenu de l'article est trop court."),
  imageUrl: z.string().url("L'URL de l'image n'est pas valide."),
  dataAiHint: z.string().optional(),
  isPublished: z.boolean().default(true),
}).transform(data => {
    if (!data.slug) {
        data.slug = generateSlug(data.title);
    }
    return data;
});

export type BlogPostFormValues = z.infer<typeof blogPostFormSchema>;


// --- Site Settings Schema ---

export const siteSettingsFormSchema = z.object({
    siteName: z.string().min(2, "Le nom du site est requis.").optional(),
    contactEmail: z.string().email("L'adresse e-mail n'est pas valide.").optional(),
    phoneNumber: z.string().optional(),
    address: z.string().optional(),
    instagram: z.string().url("L'URL Instagram n'est pas valide.").or(z.literal('')).optional(),
    facebook: z.string().url("L'URL Facebook n'est pas valide.").or(z.literal('')).optional(),
});

export type SiteSettingsFormValues = z.infer<typeof siteSettingsFormSchema>;


// --- Legacy Schemas (kept for reference if needed) ---

const productImageSchema = z.object({
  view: z.string().min(1, "La vue de l'image est requise (ex: face, droite)."),
  url: z.string().url({ message: "L'URL de l'image n'est pas valide." })
});

const colorSchema = z.object({
  name: z.string().min(1, "Le nom de la couleur est requis."),
  stock: z.coerce.number().min(0, "Le stock ne peut être négatif."),
  images: z.array(productImageSchema).min(1, "Chaque couleur doit avoir au moins une image.")
});

export const productFormSchema = z.object({
  name: z.string().min(3, { message: "Le nom du produit doit contenir au moins 3 caractères." }),
  category: z.enum(['Hijab', 'Turban', 'Casquette'], {
    required_error: "La catégorie est requise.",
  }),
  price: z.coerce.number().positive({ message: "Le prix doit être un nombre positif." }),
  sizes: z.string().min(1, { message: "Au moins une taille est requise." }),
  imageUrl: z.string().url({ message: "Veuillez entrer une URL d'image valide pour l'image principale." }),
  description: z.string().min(10, { message: "La description doit contenir au moins 10 caractères." }),
  details: z.string().optional(),
  dataAiHint: z.string().optional(),
  isFeatured: z.boolean().optional(),
  colorsData: z.string().min(1, "Les données des couleurs sont requises.").refine((val) => {
    try {
      const parsed = JSON.parse(val);
      z.array(colorSchema).min(1, "Vous devez fournir au moins une couleur.").parse(parsed);
      return true;
    } catch (e) {
      console.log("Zod validation error for colorsData:", e);
      return false;
    }
  }, { message: "Les données des couleurs doivent être un tableau JSON valide et conforme au schéma attendu (nom, stock, images avec vue/url)." }),
});
