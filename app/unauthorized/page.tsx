// src/app/unauthorized/page.tsx
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-background py-12">
      <ShieldAlert className="h-24 w-24 text-destructive mb-6" />
      <h1 className="text-4xl font-bold text-primary mb-3">Accès Refusé</h1>
      <p className="text-lg text-muted-foreground max-w-md mb-6">
        Vous n'avez pas les permissions nécessaires pour accéder à cette page. Veuillez contacter un administrateur si vous pensez qu'il s'agit d'une erreur.
      </p>
      <Button asChild>
        <Link href="/">Retour à l'accueil</Link>
      </Button>
    </div>
  );
}
