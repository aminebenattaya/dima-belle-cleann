// src/app/faq/page.tsx
import type { Metadata } from 'next';
import PageHeader from '@/components/shared/PageHeader';
import FaqAccordion from './FaqAccordion';

export const metadata: Metadata = {
  title: 'FAQ - Questions Fréquentes',
  description: 'Trouvez les réponses à vos questions sur Dima Belle, nos produits, la livraison et les retours.',
};

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Questions Fréquentes"
        description="Trouvez ici les réponses aux questions les plus courantes."
      />
      <FaqAccordion />
    </div>
  );
}
