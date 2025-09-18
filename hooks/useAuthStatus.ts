// src/hooks/useAuthStatus.ts
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface AuthStatus {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  isUserLoggedIn: boolean;
}

export function useAuthStatus(): AuthStatus {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Force a refresh of the token to get the latest custom claims.
          const idTokenResult = await currentUser.getIdTokenResult(true);
          // Check for the admin custom claim.
          setIsAdmin(!!idTokenResult.claims.admin);
        } catch (error) {
          console.error("Error getting user token with claims:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isUserLoggedIn = !loading && user !== null;

  return { user, isAdmin, loading, isUserLoggedIn };
}

/**
 * Hook to protect a client-side route.
 * Redirects if the user is not logged in or not the designated admin.
 */
export function useProtectedAdminRoute() {
  const { isUserLoggedIn, isAdmin, loading } = useAuthStatus();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isUserLoggedIn) {
        router.push('/login?redirect=/amineweldmaryem'); // Redirect to login if not connected
      } else if (!isAdmin) {
        // This case is handled by the admin layout, which shows an "Access Denied" message.
        console.warn("User does not have admin privileges.");
      }
    }
  }, [isUserLoggedIn, isAdmin, loading, router]);

  return { isUserLoggedIn, isAdmin, loading };
}
