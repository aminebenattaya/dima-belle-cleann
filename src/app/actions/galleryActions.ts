
'use server';

import { z } from 'zod';
import { addGalleryItemSubmission } from '@/services/galleryService';
import { revalidatePath } from 'next/cache';

// Zod schema for gallery submission validation
const gallerySubmissionSchema = z.object({
  customerName: z.string().min(2, { message: "Votre nom doit contenir au moins 2 caractères." }),
  imageUrl: z.string().url({ message: "L'URL de l'image (Data URL) n'est pas valide." }).min(20, {message: "L'image est requise."}),
  testimonial: z.string().optional(),
});

export async function submitGalleryPhotoAction(
  prevState: { message: string; success: boolean; errors?: any } | null,
  formData: FormData
): Promise<{ message: string; success: boolean; errors?: any }> {
  
  const rawFormData = {
    customerName: formData.get('customerName') as string,
    imageUrl: formData.get('imageUrl') as string, // This will be the Data URL from the hidden input
    testimonial: formData.get('testimonial') as string | undefined,
  };

  const validatedFields = gallerySubmissionSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    console.error("Validation errors:", validatedFields.error.flatten().fieldErrors);
    return {
      message: "Erreur de validation. Veuillez vérifier les champs.",
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const submissionData = {
        customerName: validatedFields.data.customerName,
        imageUrl: validatedFields.data.imageUrl, // This is the Data URL
        testimonial: validatedFields.data.testimonial,
    };
    const submissionId = await addGalleryItemSubmission(submissionData);

    if (submissionId) {
      revalidatePath('/customer-gallery');
      return { 
        message: "Votre photo et commentaire ont été soumis avec succès ! Ils seront visibles après approbation.", 
        success: true 
      };
    } else {
      return { message: "Erreur lors de la soumission. Veuillez réessayer.", success: false };
    }
  } catch (error) {
    console.error("Gallery submission server action error:", error);
    return { message: "Une erreur interne est survenue lors de la soumission.", success: false };
  }
}
