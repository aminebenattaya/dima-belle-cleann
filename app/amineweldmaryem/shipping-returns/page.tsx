// src/app/amineweldmaryem/shipping-returns/page.tsx
'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { getOrders, updateOrderStatus } from '@/services/orderService';
import type { Order } from '@/lib/types';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldAlert, Truck, CheckCircle, PackageOpen } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function AdminShippingReturnsPage() {
    const [shippedOrders, setShippedOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isAdmin, loading: authLoading } = useAuthStatus();
    const { toast } = useToast();
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (isAdmin) {
            const fetchData = async () => {
                setLoading(true);
                setError(null);
                try {
                    const fetchedOrders = await getOrders({ status: ['shipped', 'delivered'] });
                    setShippedOrders(fetchedOrders);
                } catch (err: any) {
                    console.error("Failed to fetch shipping/return data:", err);
                    setError(err.message || "Impossible de charger les données de livraison.");
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        } else {
            setError("Accès refusé. Vous n'avez pas les droits d'administrateur.");
            setLoading(false);
        }
    }, [isAdmin, authLoading]);

    const handleUpdateStatus = async (orderId: string, newStatus: 'delivered') => {
        setUpdatingOrderId(orderId);
        try {
            await updateOrderStatus(orderId, newStatus);
            setShippedOrders(prevOrders => 
                prevOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
            );
            toast({
                title: "Succès",
                description: "La commande a été marquée comme Livrée.",
            });
        } catch (err: any) {
            console.error("Error updating order status:", err);
            toast({
                title: "Erreur",
                description: "Impossible de mettre à jour le statut.",
                variant: "destructive",
            });
        } finally {
            setUpdatingOrderId(null);
        }
    };


    const getStatusVariant = (status: Order['status']) => {
        switch (status) {
            case 'shipped': return 'default';
            case 'delivered': return 'default';
            default: return 'secondary';
        }
    };

    const getStatusText = (status: Order['status']) => {
        const statusMap = {
            shipped: 'Expédiée',
            delivered: 'Livrée'
        };
        return statusMap[status as keyof typeof statusMap] || status;
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-lg text-muted-foreground">Chargement des expéditions...</p>
            </div>
        );
    }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Suivi des Livraisons" 
        description="Consultez les commandes qui ont été expédiées et suivez leur progression." 
      />

      {error && (
        <div className="p-12 text-center border-2 border-dashed border-destructive/50 rounded-lg bg-destructive/10">
          <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg text-destructive font-semibold">Une erreur est survenue</p>
          <p className="text-sm text-destructive/90 mt-2">{error}</p>
        </div>
      )}
      
      {!loading && !error && (
        <Card>
            <CardHeader>
                <CardTitle>Commandes Expédiées et Livrées ({shippedOrders.length})</CardTitle>
                <CardDescription>
                    Liste des commandes en cours de livraison ou déjà livrées.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {shippedOrders.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID Commande</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Ville</TableHead>
                                <TableHead>Date d'expédition</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {shippedOrders.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-mono text-xs">{order.id.substring(0,8).toUpperCase()}</TableCell>
                                    <TableCell>{order.shippingAddress?.fullName}</TableCell>
                                    <TableCell>{order.shippingAddress?.city}</TableCell>
                                    <TableCell>{order.orderDate.toLocaleDateString('fr-FR')}</TableCell>
                                    <TableCell><Badge variant={getStatusVariant(order.status)}>{getStatusText(order.status)}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            disabled={order.status === 'delivered' || updatingOrderId === order.id}
                                            onClick={() => handleUpdateStatus(order.id, 'delivered')}
                                        >
                                            {updatingOrderId === order.id 
                                                ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                                                : <CheckCircle className="mr-2 h-4 w-4" />
                                            }
                                            {updatingOrderId === order.id ? 'Mise à jour...' : 'Marquer comme Livrée'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="p-12 text-center border-2 border-dashed border-muted-foreground/30 rounded-lg bg-card">
                        <PackageOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="text-lg text-muted-foreground mt-4">Aucune commande expédiée pour le moment.</p>
                        <p className="text-sm text-muted-foreground mt-2">Lorsqu'une commande est marquée comme "Expédiée", elle apparaîtra ici.</p>
                    </div>
                )}
            </CardContent>
        </Card>
      )}

    </div>
  );
}
