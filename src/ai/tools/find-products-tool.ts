
'use server';
/**
 * @fileOverview Outil Genkit pour rechercher des produits dans la base de données.
 *
 * - findMatchingProductsTool - Un outil Genkit que l'IA peut utiliser pour trouver des produits.
 * - FindProductsInput - Le type d'entrée pour l'outil.
 * - FindProductsOutput - Le type de sortie de l'outil.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getProducts } from '@/services/productService';
import type { SuggestedProduct } from '@/lib/types';

// Schéma pour les entrées de l'outil de recherche de produits
const FindProductsInputSchema = z.object({
  category: z.string().optional().describe("La catégorie de produit à rechercher (ex: 'Hijab', 'Turban', 'Casquette')."),
  color: z.string().optional().describe("La couleur principale ou les mots-clés de couleur (ex: 'Rose', 'Bleu pastel')."),
  keywords: z.string().optional().describe("Mots-clés généraux pour rechercher dans le nom, la description ou le style du produit (ex: 'moderne épuré', 'soirée élégante', 'bohème', 'visage rond', 'tissu fluide')."),
  maxResults: z.number().optional().default(3).describe("Nombre maximum de produits à retourner."),
});
export type FindProductsInput = z.infer<typeof FindProductsInputSchema>;

// Schéma pour les produits suggérés (version simplifiée)
const SuggestedProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  imageUrl: z.string(),
  price: z.number(),
  category: z.string(),
  slug: z.string(),
});

// Schéma pour la sortie de l'outil
const FindProductsOutputSchema = z.object({
  products: z.array(SuggestedProductSchema).describe("Liste des produits correspondants trouvés."),
});
export type FindProductsOutput = z.infer<typeof FindProductsOutputSchema>;

// Définition de l'outil Genkit
export const findMatchingProductsTool = ai.defineTool(
  {
    name: 'findMatchingProductsTool',
    description: "Recherche des produits dans la boutique Dima Belle en fonction de critères spécifiés (catégorie, couleur, mots-clés incluant la morphologie du visage, le style, etc.). Utile pour trouver des articles spécifiques à suggérer à la cliente.",
    inputSchema: FindProductsInputSchema,
    outputSchema: FindProductsOutputSchema,
  },
  async (input: FindProductsInput): Promise<{ products: SuggestedProduct[] }> => {
    console.log('[findMatchingProductsTool] Input:', input);
    try {
      const fetchedProducts = await getProducts({
        category: input.category,
        color: input.color,
        keywords: input.keywords,
        limit: input.maxResults,
      });

      const suggestedProducts: SuggestedProduct[] = fetchedProducts.map(p => ({
        id: p.id,
        name: p.name,
        imageUrl: p.imageUrl,
        price: p.price,
        category: p.category,
        slug: p.slug,
      }));
      
      console.log(`[findMatchingProductsTool] Found ${suggestedProducts.length} products.`);
      return { products: suggestedProducts };

    } catch (error) {
      console.error('[findMatchingProductsTool] Error fetching products:', error);
      return { products: [] }; // Retourner une liste vide en cas d'erreur
    }
  }
);
