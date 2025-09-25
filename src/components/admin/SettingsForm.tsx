// src/components/admin/SettingsForm.tsx
'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { siteSettingsFormSchema, type SiteSettingsFormValues } from '@/lib/schemas';
import type { SiteSettings } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

// Import client-side Firestore functions
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';


interface SettingsFormProps {
  initialData: SiteSettings | null;
}

const SITE_SETTINGS_COLLECTION = 'siteConfiguration';
const GENERAL_SETTINGS_DOC_ID = 'general';

export default function SettingsForm({ initialData }: SettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SiteSettingsFormValues>({
    resolver: zodResolver(siteSettingsFormSchema),
    defaultValues: {
      siteName: initialData?.siteName || '',
      contactEmail: initialData?.contactEmail || '',
      phoneNumber: initialData?.phoneNumber || '',
      address: initialData?.address || '',
      instagram: initialData?.socialMediaLinks?.instagram || '',
      facebook: initialData?.socialMediaLinks?.facebook || '',
    },
  });

  const onSubmit: SubmitHandler<SiteSettingsFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      const settingsToUpdate = {
        siteName: data.siteName,
        contactEmail: data.contactEmail,
        phoneNumber: data.phoneNumber,
        address: data.address,
        socialMediaLinks: {
            instagram: data.instagram,
            facebook: data.facebook,
        }
      };

      // Use the client SDK to update Firestore
      const settingsDocRef = doc(db, SITE_SETTINGS_COLLECTION, GENERAL_SETTINGS_DOC_ID);
      await setDoc(settingsDocRef, settingsToUpdate, { merge: true });

      toast({
        title: 'Succès',
        description: 'Les paramètres du site ont été mis à jour.',
      });

      router.refresh(); // Revalidate the page to show new settings if needed

    } catch (error: any) {
      console.error("Error updating settings:", error);
      toast({
        title: 'Erreur',
        description: error.message || "Une erreur est survenue lors de la mise à jour.",
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Informations Générales</CardTitle>
          <CardDescription>Modifiez les informations de contact et les liens qui apparaissent sur votre site.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="siteName">Nom de la Boutique</Label>
                    <Input id="siteName" {...register('siteName')} />
                    {errors.siteName && <p className="text-sm text-destructive">{errors.siteName.message}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email de Contact</Label>
                    <Input id="contactEmail" type="email" {...register('contactEmail')} />
                    {errors.contactEmail && <p className="text-sm text-destructive">{errors.contactEmail.message}</p>}
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Numéro de Téléphone</Label>
                    <Input id="phoneNumber" type="tel" {...register('phoneNumber')} />
                    {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="address">Adresse (Optionnel)</Label>
                    <Input id="address" {...register('address')} />
                     {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="instagram">Lien Instagram</Label>
                    <Input id="instagram" type="url" {...register('instagram')} placeholder="https://instagram.com/votrenom"/>
                    {errors.instagram && <p className="text-sm text-destructive">{errors.instagram.message}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="facebook">Lien Facebook</Label>
                    <Input id="facebook" type="url" {...register('facebook')} placeholder="https://facebook.com/votrepage" />
                    {errors.facebook && <p className="text-sm text-destructive">{errors.facebook.message}</p>}
                </div>
            </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer les Paramètres'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
