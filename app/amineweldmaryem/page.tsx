// src/app/amineweldmaryem/page.tsx
'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Archive, Newspaper, Truck, Users, DollarSign, Loader2, ShieldAlert } from 'lucide-react';
import { getProductsCount } from '@/services/productService';
import { getBlogPostsCount } from '@/services/blogService';
import { getOrdersCount, getOrders } from '@/services/orderService';
import { getSalesAnalytics } from '@/services/statisticsService';
import { getUsersCount } from '@/services/userService';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { format } from 'date-fns';

type Stats = {
  totalProducts: number | null;
  totalBlogPosts: number | null;
  totalOrders: number | null;
  monthlySales: number | null;
  shippedOrders: number | null;
  totalCustomers: number | null;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: null,
    totalBlogPosts: null,
    totalOrders: null,
    monthlySales: null,
    shippedOrders: null,
    totalCustomers: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin, loading: authLoading } = useAuthStatus();

  useEffect(() => {
    if (authLoading) return;

    if (isAdmin) {
      const fetchStats = async () => {
        setLoading(true);
        setError(null);
        try {
          const salesAnalytics = await getSalesAnalytics();
          const currentMonthKey = format(new Date(), 'yyyy-MM');
          const monthlySalesValue = salesAnalytics?.monthlySales?.[currentMonthKey]?.revenue ?? 0;
          const totalCustomersValue = salesAnalytics?.totalCustomers ?? 0;
          
          const [productsCount, blogPostsCount, ordersCount, shippedOrdersList] = await Promise.all([
            getProductsCount(),
            getBlogPostsCount(),
            getOrdersCount(),
            getOrders({ status: ['shipped'] })
          ]);
          
          setStats({
            totalProducts: productsCount,
            totalBlogPosts: blogPostsCount,
            totalOrders: ordersCount,
            monthlySales: monthlySalesValue,
            shippedOrders: shippedOrdersList.length,
            totalCustomers: totalCustomersValue,
          });
        } catch (err: any) {
          console.error("Error fetching admin dashboard stats:", err);
          setError("Impossible de charger certaines statistiques. Vérifiez les règles Firestore et votre connexion.");
        } finally {
          setLoading(false);
        }
      };
      fetchStats();
    } else {
      setError("Vous n'avez pas les permissions pour voir les statistiques.");
      setLoading(false);
    }
  }, [isAdmin, authLoading]);

  const StatCard = ({ title, value, icon: Icon, description, formatAsCurrency = false }: { title: string; value: number | null; icon: React.ElementType; description: string, formatAsCurrency?: boolean }) => {
    const displayValue = loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (value !== null ? (formatAsCurrency ? `${value.toFixed(2)} DT` : value) : 'N/A');
    return (
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{displayValue}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      <PageHeader title="Tableau de Bord Administrateur" description="Vue d'ensemble de votre boutique Dima Belle." />
      
      {error && (
        <div className="p-4 text-center border border-destructive/50 rounded-lg bg-destructive/10">
          <ShieldAlert className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-sm text-destructive font-semibold">{error}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          title="Total Produits" 
          value={stats.totalProducts} 
          icon={Package} 
          description="Produits actifs dans le catalogue" 
        />
        <StatCard 
          title="Total Commandes" 
          value={stats.totalOrders} 
          icon={Archive} 
          description="Toutes les commandes enregistrées" 
        />
        <StatCard 
          title="Ventes (Ce Mois)" 
          value={stats.monthlySales} 
          icon={DollarSign} 
          description={`Revenu pour le mois de ${format(new Date(), 'MMMM')}`}
          formatAsCurrency
        />
        <StatCard 
          title="Articles de Blog" 
          value={stats.totalBlogPosts} 
          icon={Newspaper} 
          description="Articles publiés" 
        />
        <StatCard 
          title="Livraisons en Cours" 
          value={stats.shippedOrders} 
          icon={Truck} 
          description="Commandes actuellement expédiées" 
        />
        <StatCard 
          title="Total Clients" 
          value={stats.totalCustomers} 
          icon={Users} 
          description="Nombre total de clients inscrits" 
        />
      </div>
    </div>
  );
}
