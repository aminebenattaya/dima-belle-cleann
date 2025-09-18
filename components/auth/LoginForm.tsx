// src/components/auth/LoginForm.tsx
'use client'; // Ce composant est un Client Component car il utilise des hooks.

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Connexion Réussie",
        description: "Vous allez être redirigé.",
      });
      const redirectUrl = searchParams.get('redirect') || '/amineweldmaryem';
      router.push(redirectUrl);
    } catch (err: any) {
      console.error("Login error details:", err);
      const errorCode = err.code || "UNKNOWN_ERROR";
      let userFriendlyMessage = "Une erreur inattendue est survenue. Veuillez réessayer.";

      if (errorCode === 'auth/operation-not-allowed') {
        userFriendlyMessage = "Erreur de configuration : La connexion par e-mail/mot de passe n'est pas activée dans votre console Firebase. Veuillez l'activer dans la section Authentication > Sign-in method.";
      } else if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
        userFriendlyMessage = "Identifiants incorrects. Veuillez vérifier votre e-mail et votre mot de passe.";
      } else if (errorCode === 'auth/invalid-api-key') {
         userFriendlyMessage = "Clé API Firebase invalide. Vérifiez vos variables d'environnement.";
      }

      setError(userFriendlyMessage); // Affiche le message simplifié dans le formulaire
      toast({
        title: "Erreur de Connexion",
        description: userFriendlyMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
      <Card className="w-full max-w-md shadow-xl">
        <form onSubmit={handleLogin}>
            <CardHeader>
              <CardTitle>Se Connecter</CardTitle>
              <CardDescription>
                Accédez à votre profil et à vos commandes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Se Connecter
              </Button>
               <p className="text-xs text-center text-muted-foreground">
                Pas encore de compte ?{' '}
                <Link href="/register" className="underline hover:text-primary">
                  Inscrivez-vous
                </Link>
              </p>
            </CardFooter>
        </form>
      </Card>
  );
}
