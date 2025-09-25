

import Image from 'next/image';
import PageHeader from '@/components/shared/PageHeader';
import { getGalleryItems } from '@/services/galleryService';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, MessageSquareText } from 'lucide-react'; // Import MessageSquareText
import type { Metadata } from 'next';
import type { GalleryItem } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CustomerGallerySubmissionForm from '@/components/gallery/CustomerGallerySubmissionForm';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Galerie Clientes',
  description: 'Découvrez comment nos clientes portent les créations Dima Belle. Inspirez-vous et partagez votre style!',
};

export const revalidate = 3600; // Revalidate data at most every hour

const ITEMS_PER_PAGE = 12;

export default async function CustomerGalleryPage() {
  const galleryItems: GalleryItem[] = await getGalleryItems({ limit: ITEMS_PER_PAGE });

  return (
    <div className="space-y-12">
      <PageHeader
        title="La Communauté Dima Belle"
        description="Voyez comment nos magnifiques clientes incarnent l'élégance avec nos pièces. Partagez vous aussi votre look #DimaBelle!"
      />

      <section className="text-center p-6 bg-muted/30 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-3 text-primary">Partagez Votre Style !</h2>
        <p className="text-muted-foreground mb-4">
          Vous aimez votre nouvelle tenue Dima Belle ? Montrez-la nous et laissez un commentaire !
          <br/>Utilisez le hashtag <strong className="text-accent">#DimaBelle</strong> sur Instagram ou soumettez votre photo ici.
        </p>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="lg">
              <UploadCloud className="mr-2 h-5 w-5" /> Soumettre Photo & Commentaire
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Partagez votre look Dima Belle</DialogTitle>
              <DialogDescription>
                Remplissez les informations ci-dessous.
                Pour l'instant, veuillez fournir un lien (URL) vers votre image.
              </DialogDescription>
            </DialogHeader>
            <Suspense fallback={<p>Chargement du formulaire...</p>}>
              <CustomerGallerySubmissionForm />
            </Suspense>
          </DialogContent>
        </Dialog>
      </section>

      {galleryItems.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {galleryItems.map(item => (
              <Card key={item.id} className="overflow-hidden group shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <CardContent className="p-0">
                  <div className="aspect-[4/5] relative w-full">
                    <Image
                      src={(item.imageUrl && (item.imageUrl.startsWith('http') || item.imageUrl.startsWith('data:'))) ? item.imageUrl : "https://placehold.co/500x600.png"}
                      alt={`Photo de ${item.customerName}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-contain group-hover:scale-105 transition-transform duration-300"
                      data-ai-hint={item.dataAiHint || 'customer photo'}
                    />
                  </div>
                </CardContent>
                <CardFooter className="p-3 bg-background/80 backdrop-blur-sm flex-grow flex flex-col items-start">
                  <div>
                    <p className="font-semibold text-sm text-foreground">{item.customerName}</p>
                  </div>
                  {item.testimonial && (
                    <div className="mt-1 pt-1 border-t border-border/30 w-full">
                      <p className="text-xs text-muted-foreground italic flex items-start">
                        <MessageSquareText className="h-3 w-3 mr-1.5 mt-0.5 flex-shrink-0" />
                        <span>"{item.testimonial}"</span>
                      </p>
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
          {/* TODO: Add pagination or a "Load More" button if more items exist */}
        </>
      ) : (
        <p className="text-center text-muted-foreground py-12">Aucune photo dans la galerie pour le moment. Soyez la première à partager !</p>
      )}
    </div>
  );
}
