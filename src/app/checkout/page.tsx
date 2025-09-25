
// src/app/checkout/page.tsx
'use client';

import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import type { UserProfile } from '@/lib/types';
import { getUserProfile } from '@/services/userService';
import PageHeader from '@/components/shared/PageHeader';
import CheckoutFlow from '@/components/checkout/CheckoutFlow';
import { Loader2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

export default function CheckoutPage() {
  const { user, loading: authLoading, isUserLoggedIn } = useAuthStatus();
  const router = useRouter();
  const { items } = useCart();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    // Redirect if not logged in
    if (!authLoading && !isUserLoggedIn) {
      router.replace('/login?redirect=/checkout');
      return;
    }

    // Redirect if cart is empty after initial load
    if (!authLoading && items.length === 0) {
      router.replace('/products');
      return;
    }

    if (user) {
      const fetchProfile = async () => {
        setLoadingProfile(true);
        const userProfile = await getUserProfile(user.uid);
        if (userProfile) {
          setProfile(userProfile);
        } else {
          // If profile doesn't exist, we'll create a default shell
          // The CheckoutFlow component will handle the form for new users
          setProfile({
             uid: user.uid,
             email: user.email || '',
             // other fields will be undefined
          });
        }
        setLoadingProfile(false);
      };
      fetchProfile();
    }
  }, [user, authLoading, isUserLoggedIn, router, items.length]);

  if (authLoading || loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Chargement des informations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <PageHeader
        title="Finaliser ma Commande"
        description="Vérifiez vos informations et les articles avant de confirmer votre achat."
      />
      <Suspense fallback={<div className="text-center p-12">Chargement...</div>}>
        {profile ? (
           <CheckoutFlow userProfile={profile} />
        ) : (
          <p>Une erreur est survenue lors du chargement de votre profil.</p>
        )}
      </Suspense>
    </div>
  );
}
