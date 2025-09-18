// src/app/amineweldmaryem/statistics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { DollarSign, Package, ShoppingCart, User, Users, BarChart, Loader2, ShieldAlert } from 'lucide-react';
import type { SalesAnalytics } from '@/lib/types';
import { getSalesAnalytics } from '@/services/statisticsService';
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

function StatCard({ title, value, icon: Icon, formatAsCurrency = false }: { title: string; value: number | undefined | null; icon: React.ElementType, formatAsCurrency?: boolean }) {
  const displayValue = (value !== undefined && value !== null)
    ? (formatAsCurrency ? `${value.toFixed(2)} DT` : value)
    : <Loader2 className="h-5 w-5 animate-spin" />;

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{displayValue}</div>
      </CardContent>
    </Card>
  );
}

export default function AdminStatisticsPage() {
  const { isAdmin, loading: authLoading } = useAuthStatus();
  const [analytics, setAnalytics] = useState<SalesAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (isAdmin) {
      const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await getSalesAnalytics();
          setAnalytics(data);
        } catch (err: any) {
          console.error("Failed to fetch sales analytics:", err);
          setError("Impossible de charger les statistiques. Aucune donnée disponible ou erreur de permission.");
        } finally {
          setLoading(false);
        }
      };
      fetchAnalytics();
    } else {
      setError("Accès refusé. Vous n'avez pas les droits d'administrateur.");
      setLoading(false);
    }
  }, [isAdmin, authLoading]);
  
  const monthlySalesData = analytics?.monthlySales
    ? Object.entries(analytics.monthlySales).map(([month, data]) => ({
        name: new Date(month + '-02').toLocaleString('fr-FR', { month: 'short', year: '2-digit' }).replace('.', ''),
        "Chiffre d'affaires": data.revenue,
      })).sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime())
    : [];

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Chargement des statistiques...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center border-2 border-dashed border-destructive/50 rounded-lg bg-destructive/10">
        <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-lg text-destructive font-semibold">Une erreur est survenue</p>
        <p className="text-sm text-destructive/90 mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Statistiques de Ventes" description="Analysez les performances de votre boutique." />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Revenu Amine" value={analytics?.revenueAmine} icon={Users} formatAsCurrency />
        <StatCard title="Revenu Maryem" value={analytics?.revenueMaryem} icon={Users} formatAsCurrency />
        <StatCard title="Commandes Livrées" value={analytics?.totalOrdersDelivered} icon={ShoppingCart} />
        <StatCard title="Articles Vendus" value={analytics?.totalItemsSold} icon={Package} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
        <Card className="shadow-md lg:col-span-4">
          <CardHeader>
            <CardTitle>Ventes Mensuelles</CardTitle>
            <CardDescription>Chiffre d'affaires brut généré chaque mois.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {monthlySalesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={monthlySalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} DT`} />
                    <Tooltip 
                    cursor={{fill: 'hsl(var(--muted))'}}
                    contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: 'var(--radius)'
                    }}
                    />
                    <Bar dataKey="Chiffre d'affaires" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
                </ResponsiveContainer>
            ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Aucune donnée de vente pour le graphique.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md lg:col-span-3">
          <CardHeader>
            <CardTitle>Produits les Plus Vendus</CardTitle>
             <CardDescription>Top 5 des articles par quantité vendue.</CardDescription>
          </CardHeader>
          <CardContent>
             {analytics?.topSellingProducts && analytics.topSellingProducts.length > 0 ? (
                <ul className="space-y-4">
                  {analytics.topSellingProducts.slice(0, 5).map(product => (
                    <li key={product.productId} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground truncate pr-4">{product.name}</span>
                      <span className="text-muted-foreground font-semibold flex-shrink-0">{product.quantitySold} vendus</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Aucune donnée de vente de produit pour le moment.</p>
              )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
