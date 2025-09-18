// src/app/amineweldmaryem/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import SettingsForm from '@/components/admin/SettingsForm';
import { getSiteSettings } from '@/services/settingsService';
import type { SiteSettings } from '@/lib/types';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin, loading: authLoading } = useAuthStatus();

  useEffect(() => {
    if (authLoading) return;

    if (isAdmin) {
      const fetchSettings = async () => {
        setLoading(true);
        const siteSettings = await getSiteSettings();
        setSettings(siteSettings);
        setLoading(false);
      };
      fetchSettings();
    } else {
        setLoading(false);
    }
  }, [isAdmin, authLoading]);

  const renderContent = () => {
    if (loading || authLoading) {
        return (
             <Card>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-1/4" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    if (!isAdmin) {
         return <p className="text-destructive">Vous n'avez pas l'autorisation de voir cette page.</p>
    }

    return <SettingsForm initialData={settings} />;
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Paramètres du Site" description="Gérez les informations générales de votre boutique." />
      {renderContent()}
    </div>
  );
}
