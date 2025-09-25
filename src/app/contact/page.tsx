
import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MessageCircle, Link2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contactez-nous',
  description: 'Contactez Dima Belle pour toute question ou demande d\'information.',
};

export default function ContactPage() {
  const email = "connectwithdimabelle@gmail.com";
  const phone = "+216 52 424 545";
  const instagramLink = "https://www.instagram.com/belle.dima/";
  const facebookLink = "https://www.facebook.com/Maryemabdelhak2/";
  const linktreeLink = "https://linktr.ee/dimabellehijab";
  const whatsappLink = `https://wa.me/21652424545`;

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Contactez-nous"
        description="Nous sommes là pour vous aider. N'hésitez pas à nous joindre par l'un des moyens ci-dessous."
      />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Nos Coordonnées</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Mail className="h-6 w-6 text-primary" />
            <div>
              <p className="font-semibold">Email</p>
              <a href={`mailto:${email}`} className="text-muted-foreground hover:text-primary transition-colors">
                {email}
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Phone className="h-6 w-6 text-primary" />
            <div>
              <p className="font-semibold">Téléphone</p>
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-muted-foreground hover:text-primary transition-colors">
                {phone}
              </a>
            </div>
          </div>
           <div className="flex items-center gap-4">
            <Link2 className="h-6 w-6 text-primary" />
            <div>
              <p className="font-semibold">Tous nos liens</p>
               <a href={linktreeLink} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                linktr.ee/dimabellehijab
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <MessageCircle className="h-6 w-6 text-primary" />
            <div>
              <p className="font-semibold">WhatsApp</p>
              <p className="text-muted-foreground">
                Discutez avec nous directement pour une réponse rapide.
              </p>
            </div>
          </div>
           <Button asChild className="w-full" size="lg">
              <Link href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-5 w-5" /> Contacter sur WhatsApp
              </Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
