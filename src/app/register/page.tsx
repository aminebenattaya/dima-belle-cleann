// src/app/register/page.tsx
'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
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
import { updateUserProfile } from '@/services/userService'; // Ensure correct import
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRegistrationSuccess(false);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 1. Update Firebase Auth profile
      await updateProfile(user, { displayName: displayName });
      
      // 2. Create user profile in Firestore
      await updateUserProfile(user.uid, {
        email: user.email!,
        fullName: displayName,
        createdAt: new Date(),
      });

      // 3. Send verification email (unless it's the admin)
      if (user.email !== 'maryemomamine@gmail.com') {
        await sendEmailVerification(user);
        setRegistrationSuccess(true);
      } else {
        // For admin, skip verification and redirect
        toast({
          title: "Compte Administrateur Créé!",
          description: "Vous pouvez maintenant vous connecter.",
        });
        router.push('/login');
      }

    } catch (err: any) {
      console.error("Erreur d'inscription:", err);
      let userFriendlyMessage = "Une erreur est survenue lors de l'inscription.";
      if (err.code === 'auth/email-already-in-use') {
        userFriendlyMessage = "Cette adresse e-mail est déjà utilisée par un autre compte.";
      } else if (err.code === 'auth/weak-password') {
        userFriendlyMessage = "Le mot de passe doit comporter au moins 6 caractères.";
      } else if (err.code === 'auth/invalid-email') {
        userFriendlyMessage = "L'adresse e-mail n'est pas valide.";
      }
      setError(userFriendlyMessage);
      toast({ title: "Erreur d'Inscription", description: userFriendlyMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (registrationSuccess) {
    return (
       <div className="flex flex-col items-center justify-center min-h-screen bg-background py-12">
            <PageHeader title="Vérifiez votre E-mail" description="Presque fini !" />
            <Card className="w-full max-w-md shadow-xl text-center">
                <CardHeader>
                     <CardTitle>Inscription Réussie !</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <AlertTitle>Un e-mail de vérification a été envoyé !</AlertTitle>
                        <AlertDescription>
                            Veuillez cliquer sur le lien dans l'e-mail que nous vous avons envoyé à <strong>{email}</strong> pour activer votre compte.
                            <br/><br/>
                            N'oubliez pas de vérifier votre dossier <strong>Spam</strong> ou Courrier indésirable.
                        </AlertDescription>
                    </Alert>
                </CardContent>
                <CardFooter>
                    <Button asChild className="w-full">
                        <Link href="/login">Retour à la page de connexion</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background py-12">
      <PageHeader title="Créer un Compte" description="Rejoignez la communauté Dima Belle." />
      <Card className="w-full max-w-md shadow-xl">
        <form onSubmit={handleRegister}>
          <CardHeader>
            <CardTitle>Inscription</CardTitle>
            <CardDescription>
              Créez votre compte pour une expérience personnalisée.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Nom complet</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Prénom Nom"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
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
                placeholder="6 caractères minimum"
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
