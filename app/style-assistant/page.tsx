import type { Metadata } from 'next';
import PageHeader from '@/components/shared/PageHeader';
import StyleAssistantForm from './StyleAssistantForm';

export const metadata: Metadata = {
  title: 'Conseillère Style IA',
  description: 'Obtenez des recommandations de style personnalisées de notre assistante IA Dima Belle.',
};

// Revalidate data at most every hour
// This page itself is largely static until form submission, 
// but revalidation can help keep the overall shell fresh.
export const revalidate = 3600;

export default function StyleAssistantPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Votre Conseillère Style Personnalisée"
        description="Décrivez vos envies, l'occasion, et vos préférences. Notre intelligence artificielle vous proposera des tenues et accessoires Dima Belle adaptés à votre style unique."
      />
      <StyleAssistantForm />
    </div>
  );
}
