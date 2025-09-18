

// src/components/admin/ProductForm.tsx
'use client';

import { useFormStatus } from 'react-dom';
import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createProductAction } from '@/app/actions/productActions';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ProductFormProps {
  product?: Product; // For editing
}

const initialState: { message: string; success: boolean; errors?: any; productId?: string } = {
  message: '',
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? "Enregistrement..." : "Enregistrer le Produit"}
    </Button>
  );
}

export default function ProductForm({ product }: ProductFormProps) {
  const [state, formAction] = useActionState(createProductAction, initialState);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (state?.message) {
      toast({
        title: state.success ? 'Succès' : 'Erreur',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success && state.productId) {
        router.push('/amineweldmaryem/products'); 
      }
    }
  }, [state, router, toast]);

  const categories: Product['category'][] = ['Hijab', 'Turban', 'Casquette'];
  
  const defaultColorsJson = product 
    ? JSON.stringify(product.colors, null, 2) // Pretty print for editing
    : `[
  {
    "name": "jaune",
    "stock": 10,
    "images": [
      { "view": "face", "url": "https://placehold.co/600x800.png" },
      { "view": "droite", "url": "https://placehold.co/600x800.png" }
    ]
  },
  {
    "name": "rouge",
    "stock": 5,
    "images": [
      { "view": "face", "url": "https://placehold.co/600x800.png" }
    ]
  }
]`;


  return (
    <form action={formAction} className="space-y-6">
      <div>
        <Label htmlFor="name">Nom du Produit</Label>
        <Input id="name" name="name" defaultValue={product?.name} required />
        {state?.errors?.name && <p className="text-sm text-destructive mt-1">{state.errors.name[0]}</p>}
      </div>

      <div>
        <Label htmlFor="category">Catégorie</Label>
        <Select name="category" defaultValue={product?.category} required>
          <SelectTrigger id="category">
            <SelectValue placeholder="Sélectionner une catégorie" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state?.errors?.category && <p className="text-sm text-destructive mt-1">{state.errors.category[0]}</p>}
      </div>

      <div>
        <Label htmlFor="price">Prix (€)</Label>
        <Input id="price" name="price" type="number" step="0.01" defaultValue={product?.price} required />
        {state?.errors?.price && <p className="text-sm text-destructive mt-1">{state.errors.price[0]}</p>}
      </div>
      
      <div>
        <Label htmlFor="sizes">Tailles (séparées par des virgules)</Label>
        <Input id="sizes" name="sizes" defaultValue={product?.sizes.join(', ')} placeholder="Ex: S, M, L, Taille Unique" required />
        {state?.errors?.sizes && <p className="text-sm text-destructive mt-1">{state.errors.sizes[0]}</p>}
      </div>

      <div>
        <Label htmlFor="imageUrl">URL de l'Image Principale (utilisée en secours)</Label>
        <Input id="imageUrl" name="imageUrl" type="url" defaultValue={product?.imageUrl} placeholder="https://example.com/image.jpg" required />
        {state?.errors?.imageUrl && <p className="text-sm text-destructive mt-1">{state.errors.imageUrl[0]}</p>}
      </div>
      
      <div>
        <Label htmlFor="dataAiHint">Indice IA pour l'image (optionnel)</Label>
        <Input id="dataAiHint" name="dataAiHint" defaultValue={product?.dataAiHint} placeholder="Ex: Turban double-face avec fleur XL..." />
        {state?.errors?.dataAiHint && <p className="text-sm text-destructive mt-1">{state.errors.dataAiHint[0]}</p>}
      </div>
      
      <div>
        <Label htmlFor="colorsData">Données des Couleurs (Noms, Stocks, Images) au format JSON</Label>
        <Textarea 
          id="colorsData" 
          name="colorsData" 
          defaultValue={defaultColorsJson} 
          rows={15}
          placeholder='Collez ici le tableau JSON de vos couleurs.'
          required 
        />
        <p className="text-xs text-muted-foreground mt-1">
          Chaque couleur doit avoir `name` (string), `stock` (number), et un tableau `images`. Chaque image doit avoir `view` et `url`.
        </p>
        {state?.errors?.colorsData && <p className="text-sm text-destructive mt-1">{state.errors.colorsData[0]}</p>}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={5} defaultValue={product?.description} required />
        {state?.errors?.description && <p className="text-sm text-destructive mt-1">{state.errors.description[0]}</p>}
      </div>

      <div>
        <Label htmlFor="details">Détails supplémentaires (un par ligne)</Label>
        <Textarea id="details" name="details" rows={3} defaultValue={product?.details?.join('\n')} placeholder="Ex: 100% Soie Naturelle\nLavage à la main recommandé" />
        {state?.errors?.details && <p className="text-sm text-destructive mt-1">{state.errors.details[0]}</p>}
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox id="isFeatured" name="isFeatured" defaultChecked={product?.isFeatured} />
        <Label htmlFor="isFeatured" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Mettre en avant (Coup de cœur) ?
        </Label>
        {state?.errors?.isFeatured && <p className="text-sm text-destructive mt-1">{state.errors.isFeatured[0]}</p>}
      </div>

      <div className="pt-4">
        <SubmitButton />
      </div>
       {state && !state.success && state.message && !state.errors && (
         <p className="text-sm text-destructive mt-2">{state.message}</p>
       )}
    </form>
  );
}
