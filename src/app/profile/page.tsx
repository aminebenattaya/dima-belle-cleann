// src/app/profile/page.tsx
'use client';

import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut, Package, Heart } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading, isUserLoggedIn } = useAuthStatus();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isUserLoggedIn) {
      router.replace('/login?redirect=/profile');
    }
  }, [loading, isUserLoggedIn, router]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/');
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  if (loading || !isUserLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Mon Profil" description="Gérez vos informations personnelles et consultez vos commandes." />
      
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-16 w-16">
                <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'Avatar utilisateur'} />
                <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
            </Avatar>
            <div>
                 <CardTitle>{user?.displayName || 'Utilisateur'}</CardTitle>
                 <CardDescription>{user?.email}</CardDescription>
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary mb-2">Mes Actions</h3>
                <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/profile/orders">
                        <Package className="mr-2 h-4 w-4" /> Voir mon historique de commandes
                    </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/profile/wishlist">
                        <Heart className="mr-2 h-4 w-4" /> Ma Wishlist
                    </Link>
                </Button>
            </div>

            <Button variant="destructive" onClick={handleLogout} className="w-full sm:w-auto">
              <LogOut className="mr-2 h-4 w-4" /> Se déconnecter
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
