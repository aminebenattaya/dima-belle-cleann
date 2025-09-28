
// src/components/auth/LoginForm.tsx
'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword, sendEmailVerification, signInWithCredential, FacebookAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogIn } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { FirebaseError } from 'firebase/app';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from '@/components/ui/separator';
import { updateUserProfile } from '@/services/userService';

declare global {
    interface Window {
        FB: any;
    }
}

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fbLoading, setFbLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const handleRedirect = async (user: any) => {
      const idTokenResult = await user.getIdTokenResult(true);
      const isAdmin = !!idTokenResult.claims.admin;

      toast({
        title: "Connexion Réussie",
        description: "Vous allez être redirigé.",
      });
      
      const redirectUrl = searchParams.get('redirect');
      if (redirectUrl) {
          router.push(redirectUrl);
      } else if (isAdmin) {
          router.push('/amineweldmaryem');
      } else {
          router.push('/profile');
      }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNeedsVerification(false);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified && user.email !== 'maryemomamine@gmail.com') {
        setNeedsVerification(true);
        setError("Votre adresse e-mail n'a pas été vérifiée. Veuillez consulter votre boîte de réception (et votre dossier spam).");
        await auth.signOut();
        setLoading(false);
        return;
      }
      
      await handleRedirect(user);

    } catch (err: any) {
      console.error("Erreur de connexion:", err);
      let userFriendlyMessage = "L'adresse e-mail ou le mot de passe est incorrect.";
       if (err instanceof FirebaseError) {
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                userFriendlyMessage = "L'adresse e-mail ou le mot de passe est incorrect.";
            } else if (err.code === 'auth/too-many-requests') {
                 userFriendlyMessage = "Compte temporairement bloqué en raison de trop nombreuses tentatives. Réessayez plus tard.";
            }
        }
      setError(userFriendlyMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const processFbLogin = async (response: any) => {
    if (response.authResponse) {
        try {
            const credential = FacebookAuthProvider.credential(response.authResponse.accessToken);
            const userCredential = await signInWithCredential(auth, credential);
            const user = userCredential.user;

            // Create or update user profile in Firestore
            await updateUserProfile(user.uid, {
                email: user.email!,
                fullName: user.displayName,
            });
            
            await handleRedirect(user);

        } catch (error: any) {
            console.error("Erreur de connexion Facebook -> Firebase :", error);
             if (error.code === 'auth/account-exists-with-different-credential') {
                setError("Un compte existe déjà avec cette adresse e-mail. Veuillez vous connecter avec votre méthode d'origine.");
            } else {
                setError("Une erreur est survenue lors de la connexion avec Facebook.");
            }
        }
    } else {
        console.log('Connexion Facebook annulée ou échouée.');
        setError("La connexion avec Facebook a été annulée ou a échoué.");
    }
    setFbLoading(false);
  }

  const handleFacebookLogin = () => {
    if (!window.FB) {
        toast({
            title: "Erreur Facebook",
            description: "Le SDK Facebook n'a pas pu être chargé. Veuillez rafraîchir la page.",
            variant: "destructive"
        });
        return;
    }

    setFbLoading(true);
    setError(null);

    window.FB.login((response: any) => {
      processFbLogin(response).catch(err => {
        console.error("Erreur dans le traitement de la connexion Facebook :", err);
        setError("Une erreur inattendue est survenue.");
        setFbLoading(false);
      });
    }, { scope: 'email,public_profile' });
  };


  const handleResendVerification = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        toast({
          title: "E-mail de vérification renvoyé",
          description: "Veuillez consulter votre boîte de réception et votre dossier spam.",
        });
      } else {
         const tempUserCredential = await signInWithEmailAndPassword(auth, email, password);
         if(tempUserCredential.user && !tempUserCredential.user.emailVerified) {
             await sendEmailVerification(tempUserCredential.user);
             await auth.signOut();
             toast({
                title: "E-mail de vérification renvoyé",
                description: "Veuillez consulter votre boîte de réception et votre dossier spam.",
             });
         }
      }
    } catch (error) {
      console.error("Erreur lors du renvoi de l'e-mail:", error);
      setError("Impossible de renvoyer l'e-mail de vérification. Veuillez réessayer plus tard.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle>Se Connecter</CardTitle>
          <CardDescription>
            Accédez à votre profil et à vos commandes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Button variant="outline" className="w-full" onClick={handleFacebookLogin} disabled={fbLoading}>
                {fbLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                {fbLoading ? 'Connexion en cours...' : 'Se connecter avec Facebook'}
            </Button>
            <div className="flex items-center space-x-2">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">OU</span>
                <Separator className="flex-1" />
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" placeholder="votre@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                {needsVerification && (
                    <Alert variant="destructive">
                        <AlertTitle>Vérification Requise</AlertTitle>
                        <AlertDescription>
                            Votre compte n'est pas encore vérifié. Veuillez cliquer sur le lien envoyé à votre adresse e-mail.
                            <Button variant="link" className="p-0 h-auto ml-1" onClick={handleResendVerification} disabled={loading}>
                                Renvoyer l'e-mail ?
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}
                 <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Se Connecter avec l'E-mail
                </Button>
            </form>
        </CardContent>
        <CardFooter className="flex-col gap-4">
           <p className="text-xs text-center text-muted-foreground">
            Pas encore de compte ?{' '}
            <Link href="/register" className="underline hover:text-primary">
              Inscrivez-vous
            </Link>
          </p>
        </CardFooter>
    </Card>
  );
}
