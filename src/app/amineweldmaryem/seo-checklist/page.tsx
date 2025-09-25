
// src/app/amineweldmaryem/seo-checklist/page.tsx
import PageHeader from '@/components/shared/PageHeader';
import { ChecklistStep } from '@/components/admin/ChecklistStep';
import { Rocket, Search, MousePointerClick, ShieldAlert, Smartphone } from 'lucide-react';

export default function SeoChecklistPage() {
  const gscBaseUrl = "https://search.google.com/search-console";
  // Vous devrez peut-être ajouter votre domaine ici si la Search Console ne le fait pas automatiquement
  // Exemple: const domainProperty = "dimabelle.me";
  // const performanceUrl = `${gscBaseUrl}/performance/search-analytics?resource_id=sc-domain:${domainProperty}`;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Checklist d'Optimisation SEO"
        description="Suivez ces étapes pour analyser et améliorer la visibilité de votre site sur Google."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChecklistStep
          icon={Rocket}
          title="1. Analyser les Pages Performantes"
          description="Identifiez vos pages les plus populaires. Regardez celles avec beaucoup d'impressions mais peu de clics : ce sont des opportunités d'amélioration !"
          buttonText="Voir le Rapport des Pages"
          href={`${gscBaseUrl}`} // Lien générique, l'utilisateur choisira la propriété
          linkTarget="_blank"
        />

        <ChecklistStep
          icon={Search}
          title="2. Identifier les Requêtes Clés"
          description="Découvrez les mots-clés que vos clients utilisent pour vous trouver. Utilisez ces termes pour optimiser votre contenu et créer de nouveaux articles de blog."
          buttonText="Voir le Rapport des Requêtes"
          href={`${gscBaseUrl}`}
          linkTarget="_blank"
        />

        <ChecklistStep
          icon={MousePointerClick}
          title="3. Améliorer le Taux de Clics (CTR)"
          description="Pour les pages à fort potentiel (beaucoup d'impressions, faible CTR), modifiez leurs balises <title> et <meta name='description'> pour être plus attractives et inciter au clic."
          buttonText="Modifier les Pages/Produits"
          href="/amineweldmaryem/products"
        />

        <ChecklistStep
          icon={ShieldAlert}
          title="4. Corriger les Erreurs d'Indexation"
          description="Assurez-vous que Google peut accéder à toutes vos pages importantes. Corrigez les erreurs 404 (pages introuvables) et autres problèmes d'exploration signalés."
          buttonText="Voir le Rapport d'Indexation"
          href={`${gscBaseUrl}`}
          linkTarget="_blank"
        />
        
        <ChecklistStep
          icon={Smartphone}
          title="5. Vérifier l'Ergonomie Mobile"
          description="Votre site doit être parfait sur mobile. Google pénalise les sites qui ne le sont pas. Vérifiez ce rapport pour corriger les problèmes de lisibilité ou d'éléments trop rapprochés."
          buttonText="Voir le Rapport Mobile"
          href={`${gscBaseUrl}`}
          linkTarget="_blank"
        />
      </div>
    </div>
  );
}
