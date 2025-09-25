import Link from 'next/link';
import { Facebook, Instagram, MessageCircle } from 'lucide-react';
import { getSiteSettings } from '@/services/settingsService';

export default async function Footer() {
  const currentYear = new Date().getFullYear();
  const settings = await getSiteSettings();

  const instagramUrl = settings?.socialMediaLinks?.instagram || "https://www.instagram.com/belle.dima/";
  const facebookUrl = settings?.socialMediaLinks?.facebook || "https://www.facebook.com/Maryemabdelhak2/";
  const whatsappNumber = settings?.phoneNumber || "+21652424545";
  const whatsappLink = whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}` : '#';


  return (
    <footer className="bg-card border-t border-border/40 text-muted-foreground mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold text-primary mb-4" style={{ fontFamily: 'var(--font-lora)'}}>{settings?.siteName || 'Dima Belle'}</h3>
            <p className="text-sm max-w-sm">Mode modeste, élégance intemporelle. Découvrez nos créations uniques qui subliment la femme moderne avec raffinement.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Liens Utiles</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contactez-nous</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="/shipping" className="hover:text-primary transition-colors">Livraison & Retours</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Termes & Conditions</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Suivez-nous</h3>
            <div className="flex space-x-4">
              <Link href={instagramUrl} aria-label="Instagram" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                <Instagram size={24} />
              </Link>
              <Link href={facebookUrl} aria-label="Facebook" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                <Facebook size={24} />
              </Link>
              <Link href={whatsappLink} aria-label="WhatsApp" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                <MessageCircle size={24} />
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border/60 text-center text-sm">
          <p>&copy; {currentYear} {settings?.siteName || 'Dima Belle'}. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
