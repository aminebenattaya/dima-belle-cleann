
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getStyleRecommendation, type StyleRecommendationInput, type StyleRecommendationOutput } from '@/ai/flows/style-recommendation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, ExternalLink } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import Link from 'next/link';
import type { SuggestedProduct } from '@/lib/types';

const itemPreferencesOptions = ['Hijab', 'Turban', 'Casquette', 'Abaya', 'Robe', 'Ensemble', 'Autre'];
const faceShapeOptions = ['Ovale', 'Rond', 'Carré', 'Long', 'En cœur', 'Je ne sais pas'];

const formSchema = z.object({
  occasion: z.string().min(3, { message: "Veuillez décrire l'occasion (au moins 3 caractères)." }),
  faceShape: z.string().optional(),
  stylePreferences: z.string().min(10, { message: "Décrivez votre style (au moins 10 caractères)." }),
  colorPreferences: z.string().min(3, { message: "Quelles sont vos couleurs préférées (au moins 3 caractères)?" }),
  itemPreferences: z.string({ required_error: "Veuillez sélectionner un type de vêtement." }),
  additionalDetails: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

// Fonction pour vérifier si une URL est autorisée (simplifiée car la config next a changé)
const isUrlAllowed = (url: string): boolean => {
  if (!url) return false;
  return url.startsWith('http');
};


export default function StyleAssistantForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendationOutput, setRecommendationOutput] = useState<StyleRecommendationOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      occasion: '',
      faceShape: '',
      stylePreferences: '',
      colorPreferences: '',
      itemPreferences: '',
      additionalDetails: '',
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setRecommendationOutput(null);
    try {
      const result = await getStyleRecommendation(data as StyleRecommendationInput);
      setRecommendationOutput(result);
      toast({
        title: "Recommandation Générée!",
        description: "Votre conseil style personnalisé est prêt.",
      });
    } catch (error) {
      console.error('Error getting style recommendation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer la recommendation pour le moment. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle>Demandez Conseil à Notre IA</CardTitle>
        <CardDescription>Remplissez ce formulaire pour recevoir une suggestion personnalisée et des idées de produits.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="occasion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occasion</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Soirée élégante, quotidien..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="faceShape"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Forme de votre visage</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez une forme" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {faceShapeOptions.map(option => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                       <FormDescription className="text-xs">Important pour les hijabs/turbans.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <FormField
              control={form.control}
              name="stylePreferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Préférences de Style</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ex: Moderne et épuré, bohème chic, classique intemporel..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="colorPreferences"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Préférences de Couleurs</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Tons pastels, vifs, neutres..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="itemPreferences"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de Vêtement Principal</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {itemPreferencesOptions.map(option => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <FormField
              control={form.control}
              name="additionalDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Détails Additionnels (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ex: Je cherche quelque chose de confortable, je n'aime pas les imprimés animaliers..." {...field} />
                  </FormControl>
                   <FormDescription className="text-xs">Plus vous donnez de détails, meilleure sera la recommandation.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col items-stretch">
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? 'Analyse en cours...' : 'Obtenir ma Recommandation'}
            </Button>
          </CardFooter>
        </form>
      </Form>

      {recommendationOutput && (
        <div className="mt-8 p-6 border-t">
          <h3 className="text-2xl font-semibold mb-4 text-primary">Votre Suggestion Personnalisée ✨</h3>
          <Card className="bg-muted/50 mb-6">
            <CardContent className="p-6 space-y-3">
              <div>
                <h4 className="font-semibold text-lg">Recommandation de Style :</h4>
                <p className="text-foreground/90">{recommendationOutput.recommendation}</p>
              </div>
              <div>
                <h4 className="font-semibold text-lg">Le Conseil de notre Experte :</h4>
                <p className="text-foreground/90">{recommendationOutput.reasoning}</p>
              </div>
            </CardContent>
          </Card>

          {recommendationOutput.suggestedProducts && recommendationOutput.suggestedProducts.length > 0 && (
            <div>
              <h4 className="text-xl font-semibold mb-3 text-primary">Articles Dima Belle qui pourraient vous plaire :</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendationOutput.suggestedProducts.map((product: SuggestedProduct) => {
                  const isSafeUrl = isUrlAllowed(product.imageUrl);
                  return (
                  <Card key={product.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                    <Link href={`/products/${product.slug}`} target="_blank" rel="noopener noreferrer" className="block">
                      <div className="relative aspect-[3/4] w-full">
                        <Image 
                          src={isSafeUrl ? product.imageUrl : "https://placehold.co/300x400.png"} 
                          alt={product.name} 
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-contain" 
                          data-ai-hint={`${product.category} product`}
                        />
                      </div>
                      <CardContent className="p-3">
                        <h5 className="font-semibold text-sm truncate" title={product.name}>{product.name}</h5>
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                        <p className="text-sm font-medium text-accent mt-1">{product.price.toFixed(2)} DT</p>
                      </CardContent>
                    </Link>
                     <CardFooter className="p-3 pt-0">
                        <Button variant="outline" size="sm" asChild className="w-full">
                          <Link href={`/products/${product.slug}`} target="_blank" rel="noopener noreferrer">
                            Voir l'article <ExternalLink className="ml-2 h-3 w-3" />
                          </Link>
                        </Button>
                      </CardFooter>
                  </Card>
                );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
