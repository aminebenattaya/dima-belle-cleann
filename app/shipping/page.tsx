
import type { Metadata } from 'next';
import PageHeader from '@/components/shared/PageHeader';

export const metadata: Metadata = {
  title: 'Livraison & Retours',
  description: 'Informations sur les politiques de livraison et de retour de Dima Belle.',
};

export default function ShippingPage() {
  return (
    <div className="max-w-3xl mx-auto prose prose-lg">
      <PageHeader
        title="Livraison & Retours"
      />
      
      <h2>Livraison</h2>
      <p>
        Nous livrons dans toute la Tunisie. Les commandes sont généralement traitées et expédiées dans un délai de 2 à 3 jours ouvrables. Une fois votre commande expédiée, vous recevrez un email de confirmation avec les détails de suivi.
      </p>
      <p>Les frais de livraison sont calculés au moment du paiement en fonction de votre adresse.</p>

      <h2 className="mt-8">Retours</h2>
      <p>
        Votre satisfaction est notre priorité. Si un article ne vous convient pas, vous pouvez le retourner dans les 7 jours suivant sa réception, à condition qu'il soit dans son état d'origine, non porté, non lavé et avec toutes ses étiquettes.
      </p>
      <p>
        Pour initier un retour, veuillez nous contacter à notre adresse e-mail avec votre numéro de commande et la raison du retour. Les frais de retour sont à la charge du client, sauf en cas d'erreur de notre part.
      </p>
    </div>
  );
}
