// src/app/login/page.tsx
'use client';

import { Suspense } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import LoginForm from '@/components/auth/LoginForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

// Fallback skeleton component to show while LoginForm is loading
function LoginFormSkeleton() {
  return (
    <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <Skeleton className="h-7 w-2/5" />
          <Skeleton className="h-4 w-4/5" />
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
            </div>
             <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
            </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-1/2" />
        </CardFooter>
      </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background py-12">
      <PageHeader title="Connexion" description="Accédez à votre compte Dima Belle." />
      <Suspense fallback={<LoginFormSkeleton />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
