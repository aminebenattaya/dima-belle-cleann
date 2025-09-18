// src/app/register/page.tsx
'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/shared/PageHeader';
import { Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { createUserProfile } from '@/services/userService'; // Import the new service function

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Mettre à jour le profil de l'utilisateur avec son nom
      await updateProfile(user, {
        displayName: name,
      });

      // Create user profile document in Firestore
      await createUserProfile(user.uid, {
        email: user.email!,
        fullName: name,
      });

      toast({
        title: "Inscription Réussie",
        description: "Bienvenue ! Vous allez être redirigé vers l'accueil.",
      });
      router.push('/'); // Redirige vers l'accueil après l'inscription
    } catch (err: any) {
      console.error("Register error details:", err);
      let userFriendlyMessage = "Une erreur est survenue. Veuillez réessayer.";
      if (err.code === 'auth/email-already-in-use') {
        userFriendlyMessage = "Cette adresse e-mail est déjà utilisée par un autre compte.";
      } else if (err.code === 'auth/weak-password') {
        userFriendlyMessage = "Le mot de passe doit contenir au moins 6 caractères.";
      }
      setError(userFriendlyMessage);
      toast({
        title: "Erreur d'Inscription",
        description: userFriendlyMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background py-12">
      <PageHeader title="Créer un Compte" description="Rejoignez la communauté Dima Belle." />
      <Card className="w-full max-w-md shadow-xl">
        <form onSubmit={handleRegister}>
          <CardHeader>
            <CardTitle>Inscription</CardTitle>
            <CardDescription>
              Créez votre compte pour une expérience d'achat personnalisée.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                type="text"
                placeholder="Ex: Fatima Zahra"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
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
                placeholder="6 caractères minimum"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer mon compte
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Vous avez déjà un compte ?{' '}
              <Link href="/login" className="underline hover:text-primary">
                Se connecter
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
