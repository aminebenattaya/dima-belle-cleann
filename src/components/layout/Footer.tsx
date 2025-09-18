import Link from 'next/link';
import { Facebook, Instagram, MessageCircle } from 'lucide-react';
import { getSiteSettings } from '@/services/settingsService'; // Import the service

export default async function Footer() {
  const currentYear = new Date().getFullYear();
  const settings = await getSiteSettings();

  const instagramUrl = settings?.socialMediaLinks?.instagram || "https://www.instagram.com/belle.dima/";
  const facebookUrl = settings?.socialMediaLinks?.facebook || "https://www.facebook.com/Maryemabdelhak2/";
  const whatsappNumber = settings?.phoneNumber || "+21652424545";
  const whatsappLink = whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}` : '#';


  return (
    <footer className="bg-muted/50 border-t border-border/40 text-muted-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">{settings?.siteName || 'Dima Belle'}</h3>
            <p className="text-sm">Mode modeste, élégance intemporelle.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Liens Utiles</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact" className="hover:text-primary">Contactez-nous</Link></li>
              <li><Link href="/faq" className="hover:text-primary">FAQ</Link></li>
              <li><Link href="/shipping" className="hover:text-primary">Livraison & Retours</Link></li>
              <li><Link href="/terms" className="hover:text-primary">Termes & Conditions</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Suivez-nous</h3>
            <div className="flex space-x-4">
              <Link href={instagramUrl} aria-label="Instagram" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                <Instagram size={24} />
              </Link>
              <Link href={facebookUrl} aria-label="Facebook" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                <Facebook size={24} />
              </Link>
              <Link href={whatsappLink} aria-label="WhatsApp" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                <MessageCircle size={24} />
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border/60 text-center text-sm">
          <p>&copy; {currentYear} {settings?.siteName || 'Dima Belle'}. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
