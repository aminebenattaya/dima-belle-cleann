// src/components/checkout/CheckoutForm.tsx
'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { UserProfile } from '@/lib/types';

const shippingSchema = z.object({
  fullName: z.string().min(3, "Le nom complet est requis.").max(100),
  addressLine1: z.string().min(5, "L'adresse est requise.").max(150),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "La ville est requise.").max(50),
  postalCode: z.string().min(4, "Le code postal est requis.").max(10),
  country: z.string().min(2, "Le pays est requis.").max(50),
  phoneNumber: z.string().min(8, "Un numéro de téléphone valide est requis.").max(20),
});

export type ShippingFormValues = z.infer<typeof shippingSchema>;

interface CheckoutFormProps {
  userProfile: UserProfile;
  onSave: (data: ShippingFormValues) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export default function CheckoutForm({ userProfile, onSave, onCancel, isSaving }: CheckoutFormProps) {
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      fullName: userProfile.fullName || '',
      addressLine1: userProfile.addressLine1 || '',
      addressLine2: userProfile.addressLine2 || '',
      city: userProfile.city || '',
      postalCode: userProfile.postalCode || '',
      country: userProfile.country || 'Tunisie',
      phoneNumber: userProfile.phoneNumber || '',
    },
  });

  const onSubmit: SubmitHandler<ShippingFormValues> = (data) => {
    onSave(data);
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Adresse de Livraison</CardTitle>
        <CardDescription>
          {userProfile.fullName ? "Vérifiez ou mettez à jour vos informations." : "Veuillez entrer vos coordonnées pour la livraison."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="fullName">Nom complet</Label>
            <Input id="fullName" {...register('fullName')} />
            {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="addressLine1">Adresse</Label>
            <Input id="addressLine1" {...register('addressLine1')} />
            {errors.addressLine1 && <p className="text-sm text-destructive">{errors.addressLine1.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="addressLine2">Appartement, suite, etc. (optionnel)</Label>
            <Input id="addressLine2" {...register('addressLine2')} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="city">Ville</Label>
              <Input id="city" {...register('city')} />
              {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="postalCode">Code Postal</Label>
              <Input id="postalCode" {...register('postalCode')} />
              {errors.postalCode && <p className="text-sm text-destructive">{errors.postalCode.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="country">Pays</Label>
            <Input id="country" {...register('country')} />
            {errors.country && <p className="text-sm text-destructive">{errors.country.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
            <Input id="phoneNumber" type="tel" {...register('phoneNumber')} />
            {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>}
          </div>
          
          <div className="pt-4 flex flex-col sm:flex-row gap-2">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Enregistrement..." : "Enregistrer et Continuer"}
            </Button>
            {userProfile.fullName && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
                Annuler
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
