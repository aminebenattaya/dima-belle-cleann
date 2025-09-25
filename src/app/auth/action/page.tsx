// src/app/auth/action/page.tsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { applyActionCode } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

function AuthActionHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Vérification en cours, veuillez patienter...');

  useEffect(() => {
    const mode = searchParams.get('mode');
    const actionCode = searchParams.get('oobCode');

    if (mode === 'verifyEmail' && actionCode) {
      handleVerifyEmail(actionCode);
    } else {
      setStatus('error');
      setMessage("Paramètres d'action invalides.");
    }
  }, [searchParams]);

  const handleVerifyEmail = async (actionCode: string) => {
    try {
      await applyActionCode(auth, actionCode);
      setStatus('success');
      setMessage('Votre adresse e-mail a été vérifiée avec succès ! Vous pouvez maintenant vous connecter.');
    } catch (error) {
      setStatus('error');
      setMessage("Le lien de vérification est invalide ou a expiré. Veuillez réessayer de vous connecter pour recevoir un nouveau lien.");
      console.error("Error verifying email:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <CardTitle className="flex flex-col items-center justify-center gap-4">
            {status === 'loading' && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
            {status === 'success' && <CheckCircle className="h-12 w-12 text-green-600" />}
            {status === 'error' && <XCircle className="h-12 w-12 text-destructive" />}
            {status === 'loading' && 'Vérification en cours'}
            {status === 'success' && 'Vérification Réussie'}
            {status === 'error' && 'Échec de la Vérification'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-lg">
            {message}
          </CardDescription>
        </CardContent>
        <CardContent>
            {status !== 'loading' && (
                <Button asChild>
                    <Link href="/login">Aller à la page de connexion</Link>
                </Button>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ActionPage() {
    return (
        <Suspense fallback={<div>Chargement...</div>}>
            <AuthActionHandler />
        </Suspense>
    )
}
