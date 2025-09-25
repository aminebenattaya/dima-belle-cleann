// src/components/admin/DynamicProductForm.tsx
'use client';

import { useState } from 'react';
import { useForm, useFieldArray, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addProductFormSchema, type AddProductFormValues } from '@/lib/schemas';
import type { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';

import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';


interface DynamicProductFormProps {
  product?: Product;
}

export default function DynamicProductForm({ product }: DynamicProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const isEditMode = !!product;

  const initialColors = (product?.colors && product.colors.length > 0)
    ? product.colors.map(c => ({
        name: c.name || '',
        stock: typeof c.stock === 'number' ? c.stock : 0,
        images: (c.images && c.images.length > 0) ? c.images : [{ view: 'face', url: '' }],
      }))
    : [{ name: '', stock: 0, images: [{ view: 'face', url: '' }] }];

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddProductFormValues>({
    resolver: zodResolver(addProductFormSchema),
    defaultValues: {
      productName: product?.name || '',
      slug: product?.slug || '',
      description: product?.description || '',
      category: product?.category,
      price: product?.price || 0,
      colors: initialColors,
      sizes: product?.sizes?.join(', ') || 'Taille Unique',
      details: product?.details?.join('\n') || '',
      isFeatured: product?.isFeatured || false,
      dataAiHint: product?.dataAiHint || '',
    },
  });

  const { fields: colorFields, append: appendColor, remove: removeColor } = useFieldArray({
    control,
    name: 'colors',
  });

  const onSubmit: SubmitHandler<AddProductFormValues> = async (data) => {
    setIsSubmitting(true);

    const { productName, price, colors, description, category, sizes, details, isFeatured, dataAiHint, slug } = data;
    
    // The main image URL is the first image of the first color variant
    const mainImageUrl = colors[0]?.images[0]?.url || '';

    const dataToSave: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
      name: productName,
      slug: slug!, // Slug is guaranteed to exist by the transform
      price: price,
      description: description,
      category: category,
      colors: colors,
      sizes: sizes.split(',').map(s => s.trim()).filter(Boolean),
      imageUrl: mainImageUrl, // Use the dynamically determined URL
      details: details?.split('\n').map(d => d.trim()).filter(Boolean) || [],
      isFeatured: isFeatured,
      dataAiHint: dataAiHint || `${category} ${productName}`,
    };

    try {
      if (isEditMode && product?.id) {
        // Update existing product
        const productDocRef = doc(db, 'products', product.id);
        await updateDoc(productDocRef, {
            ...dataToSave,
            updatedAt: serverTimestamp(),
        });
        toast({ title: 'Succès', description: `Produit "${productName}" mis à jour avec succès !` });
      } else {
        // Add new product
        await addDoc(collection(db, 'products'), {
            ...dataToSave,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        toast({ title: 'Succès', description: `Produit "${productName}" ajouté avec succès !` });
      }
      router.push('/amineweldmaryem/products');
      router.refresh(); // Force a refresh to show the updated data
    } catch (error: any) {
      console.error("Firestore error:", error);
      toast({
        title: 'Erreur',
        description: error.message || "Une erreur est survenue lors de l'enregistrement.",
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
            <Label htmlFor="productName">Nom du Produit</Label>
            <Input id="productName" {...register('productName')} />
            {errors.productName && <p className="text-sm text-destructive mt-1">{errors.productName.message}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input id="slug" {...register('slug')} placeholder="laissez-vide-pour-auto-generation" disabled={isEditMode} />
            <p className="text-xs text-muted-foreground mt-1">
                Laisser vide pour générer automatiquement à partir du nom. Non modifiable après création.
            </p>
            {errors.slug && <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register('description')} placeholder="Décrivez le produit, ses matières, sa coupe..." />
        {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="category">Catégorie</Label>
           <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hijab">Hijab</SelectItem>
                  <SelectItem value="Turban">Turban</SelectItem>
                  <SelectItem value="Casquette">Casquette</SelectItem>
                   <SelectItem value="Abaya">Abaya</SelectItem>
                   <SelectItem value="Robe">Robe</SelectItem>
                   <SelectItem value="Ensemble">Ensemble</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && <p className="text-sm text-destructive mt-1">{errors.category.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Prix (en DT)</Label>
          <Input id="price" type="number" step="0.01" {...register('price', { valueAsNumber: true })} />
          {errors.price && <p className="text-sm text-destructive mt-1">{errors.price.message}</p>}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="sizes">Tailles (séparées par des virgules)</Label>
        <Input id="sizes" {...register('sizes')} placeholder="Ex: S, M, L, Taille Unique" />
        {errors.sizes && <p className="text-sm text-destructive mt-1">{errors.sizes.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="details">Détails (un par ligne)</Label>
        <Textarea id="details" {...register('details')} placeholder="Ex: 100% Soie Naturelle\nLavage à la main recommandé" />
        {errors.details && <p className="text-sm text-destructive mt-1">{errors.details.message}</p>}
      </div>


      <Separator />

      <div>
        <h3 className="text-lg font-medium mb-4">Variantes de Couleur</h3>
        <div className="space-y-6">
          {colorFields.map((colorItem, colorIndex) => (
            <Card key={colorItem.id} className="p-4 bg-muted">
              <CardHeader className="p-0 pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-md">Couleur #{colorIndex + 1}</CardTitle>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeColor(colorIndex)} disabled={colorFields.length <= 1}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`colors.${colorIndex}.name`}>Nom de la couleur</Label>
                    <Input {...register(`colors.${colorIndex}.name`)} />
                    {errors.colors?.[colorIndex]?.name && <p className="text-sm text-destructive mt-1">{errors.colors[colorIndex]?.name?.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`colors.${colorIndex}.stock`}>Stock</Label>
                    <Input type="number" {...register(`colors.${colorIndex}.stock`, { valueAsNumber: true })} />
                    {errors.colors?.[colorIndex]?.stock && <p className="text-sm text-destructive mt-1">{errors.colors[colorIndex]?.stock?.message}</p>}
                  </div>
                </div>

                <ImageFields colorIndex={colorIndex} control={control} register={register} errors={errors} />

              </CardContent>
            </Card>
          ))}
        </div>
        <Button type="button" variant="outline" onClick={() => appendColor({ name: '', stock: 0, images: [{ view: 'face', url: '' }] })} className="mt-4">
          <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une couleur
        </Button>
      </div>
      
      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start pt-4">
        <div className="space-y-2">
            <Label htmlFor="dataAiHint">Indice IA pour l'image (optionnel)</Label>
            <Input id="dataAiHint" {...register('dataAiHint')} placeholder="Ex: foulard soie rose" />
            {errors.dataAiHint && <p className="text-sm text-destructive mt-1">{errors.dataAiHint.message}</p>}
        </div>

        <div className="space-y-2 pt-2">
          <Controller
            name="isFeatured"
            control={control}
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Checkbox id="isFeatured" checked={field.value} onCheckedChange={field.onChange} />
                <Label htmlFor="isFeatured" className="font-medium">
                  Mettre en avant (Coup de cœur) ?
                </Label>
              </div>
            )}
          />
          {errors.isFeatured && <p className="text-sm text-destructive mt-1">{errors.isFeatured.message}</p>}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isSubmitting ? 'Enregistrement...' : isEditMode ? 'Enregistrer les modifications' : 'Enregistrer le Produit'}
      </Button>
    </form>
  );
}

// Sub-component for handling nested image fields
function ImageFields({ colorIndex, control, register, errors }: any) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `colors.${colorIndex}.images`
    });

    return (
        <div className="space-y-4 pt-2">
            <Label>Images pour cette couleur</Label>
            {fields.map((imageItem, imageIndex) => (
                <div key={imageItem.id} className="flex items-end gap-2 p-2 border rounded-md bg-background">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-grow">
                        <div className="space-y-1">
                            <Label htmlFor={`colors.${colorIndex}.images.${imageIndex}.view`} className="text-xs">Vue</Label>
                            <Input placeholder="ex: face, droite" {...register(`colors.${colorIndex}.images.${imageIndex}.view`)} />
                             {errors.colors?.[colorIndex]?.images?.[imageIndex]?.view && <p className="text-sm text-destructive mt-1">{errors.colors?.[colorIndex]?.images?.[imageIndex]?.view?.message}</p>}
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor={`colors.${colorIndex}.images.${imageIndex}.url`} className="text-xs">URL de l'image</Label>
                            <Input type="url" placeholder="https://..." {...register(`colors.${colorIndex}.images.${imageIndex}.url`)} />
                            {errors.colors?.[colorIndex]?.images?.[imageIndex]?.url && <p className="text-sm text-destructive mt-1">{errors.colors?.[colorIndex]?.images?.[imageIndex]?.url?.message}</p>}
                        </div>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(imageIndex)} disabled={fields.length <= 1}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            ))}
            <Button type="button" size="sm" variant="secondary" onClick={() => append({ view: '', url: '' })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une image
            </Button>
        </div>
    );
}
