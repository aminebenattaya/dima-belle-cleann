
import type { Metadata } from 'next';
import PageHeader from '@/components/shared/PageHeader';

export const metadata: Metadata = {
  title: 'Termes & Conditions',
  description: 'Consultez les termes et conditions d\'utilisation du site Dima Belle.',
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto prose prose-lg">
      <PageHeader
        title="Termes & Conditions"
      />
      
      <h2>1. Introduction</h2>
      <p>
        Bienvenue sur Dima Belle. En accédant à notre site web et en utilisant nos services, vous acceptez d'être lié par les termes et conditions suivants. Veuillez les lire attentivement.
      </p>

      <h2>2. Utilisation du Site</h2>
      <p>
        Vous acceptez d'utiliser ce site uniquement à des fins légales et d'une manière qui ne porte pas atteinte aux droits d'autrui, ni ne restreint ou n'inhibe l'utilisation et la jouissance de ce site par quiconque.
      </p>

      <h2>3. Produits</h2>
      <p>
        Nous nous efforçons de présenter les couleurs et les images de nos produits aussi fidèlement que possible. Cependant, nous ne pouvons garantir que l'affichage des couleurs sur votre moniteur sera exact. Tous les descriptifs de produits et les prix sont sujets à changement sans préavis.
      </p>
      
      <h2>4. Propriété Intellectuelle</h2>
      <p>
        Le contenu de ce site, y compris les textes, graphiques, logos et images, est la propriété de Dima Belle et est protégé par les lois sur le droit d'auteur.
      </p>

      <h2>5. Limitation de Responsabilité</h2>
      <p>
        Dima Belle ne sera pas responsable des dommages directs, indirects, accessoires, spéciaux ou consécutifs résultant de l'utilisation ou de l'incapacité d'utiliser notre site ou nos produits.
      </p>

      <p className="text-sm text-muted-foreground mt-8">
        Dernière mise à jour : 10 Juillet 2024
      </p>
    </div>
  );
}
