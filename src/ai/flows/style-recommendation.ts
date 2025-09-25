// src/ai/flows/style-recommendation.ts
'use server';

import { ai, generate } from '@/ai/genkit'; // ok si genkit est bien installé
import { z } from 'genkit';
import { findMatchingProductsTool } from '@/ai/tools/find-products-tool';
import type { SuggestedProduct } from '@/lib/types';

// Input schema
const StyleRecommendationInputSchema = z.object({
  message: z.string().describe("The user's message or query to the chatbot."),
});
export type StyleRecommendationInput = z.infer<typeof StyleRecommendationInputSchema>;

// Suggested products schema
const SuggestedProductSchemaForFlow = z.object({
  id: z.string(),
  name: z.string(),
  imageUrl: z.string(),
  price: z.number(),
  category: z.string(),
  slug: z.string(),
});

const StyleRecommendationOutputSchema = z.object({
  recommendation: z.string().describe(
    "The chatbot's response to the user, in French. Friendly, expert, and reassuring."
  ),
  suggestedProducts: z
    .array(SuggestedProductSchemaForFlow)
    .optional()
    .describe(
      "Products from Dima Belle that match the user's query (from findMatchingProductsTool only)."
    ),
});
export type StyleRecommendationOutput = z.infer<typeof StyleRecommendationOutputSchema>;

// Function called from UI
export async function getStyleRecommendation(
  input: StyleRecommendationInput
): Promise<StyleRecommendationOutput> {
  return styleRecommendationFlow(input);
}

// Genkit flow definition
const styleRecommendationFlow = ai.defineFlow(
  {
    name: 'styleRecommendationFlow',
    inputSchema: StyleRecommendationInputSchema,
    outputSchema: StyleRecommendationOutputSchema,
  },
  async (input): Promise<StyleRecommendationOutput> => {
    const llmResponse = await generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: `Tu es un assistant de mode expert et amical pour "Dima Belle"...
CONTEXTE UTILISATEUR : "${input.message}"
TES INSTRUCTIONS : ...`, // tu peux conserver ton prompt complet ici
      tools: [findMatchingProductsTool],
      output: { schema: StyleRecommendationOutputSchema },
    });

    const output = llmResponse.output();
    if (!output) throw new Error("La réponse du modèle est vide ou invalide.");

    return output;
  }
);
