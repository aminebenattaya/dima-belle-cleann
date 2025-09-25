
import type { Metadata } from 'next';
import PageHeader from '@/components/shared/PageHeader';
import ChatInterface from './ChatInterface'; // Changed from StyleAssistantForm

export const metadata: Metadata = {
  title: 'Conseillère Style IA',
  description: 'Discutez avec notre assistante IA Dima Belle pour obtenir des recommandations de style personnalisées.',
};

export default function StyleAssistantPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Votre Conseillère Style Personnalisée"
        description="Discutez avec notre intelligence artificielle pour trouver les tenues et accessoires Dima Belle qui correspondent à votre style unique."
      />
      <ChatInterface />
    </div>
  );
}
