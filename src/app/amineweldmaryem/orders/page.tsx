
// src/app/amineweldmaryem/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { getOrders, updateOrderStatus } from '@/services/orderService';
import { deleteOrderAndRestockAction } from '@/app/actions/orderActions';
import type { Order } from '@/lib/types';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ShieldAlert, Eye, Truck, CheckCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin, loading: authLoading } = useAuthStatus();
  const router = useRouter();
  const { toast } = useToast();
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (isAdmin) {
      const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
          console.log("[AdminOrdersPage] Admin confirmed. Fetching orders...");
          const fetchedOrders = await getOrders();
          console.log(`[AdminOrdersPage] ${fetchedOrders.length} orders fetched.`);
          setOrders(fetchedOrders);
        } catch (err: any) {
          console.error("[AdminOrdersPage] Error during order fetch:", err);
          setError(err.message || "Impossible de charger les commandes. Vérifiez vos permissions Firestore et votre connexion.");
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    } else {
      setError("Accès refusé. Vous n'avez pas les droits d'administrateur.");
      setLoading(false);
    }
  }, [isAdmin, authLoading, router]);

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
      setUpdatingOrderId(orderId);
      try {
          await updateOrderStatus(orderId, newStatus);
          setOrders(prevOrders => prevOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
          toast({
              title: "Succès",
              description: `La commande a été marquée comme "${getStatusText(newStatus)}".`,
          });
          router.refresh(); 
      } catch (err: any) {
          console.error("Error updating order status:", err);
          toast({
              title: "Erreur",
              description: "Impossible de mettre à jour le statut de la commande.",
              variant: "destructive",
          });
      } finally {
        setUpdatingOrderId(null);
      }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!orderId || typeof orderId !== 'string') {
        toast({
            title: "Erreur Interne",
            description: "Impossible de supprimer la commande car son identifiant est manquant.",
            variant: "destructive",
        });
        console.error("handleDeleteOrder called with invalid orderId:", orderId);
        return;
    }
    
    setDeletingOrderId(orderId);
    try {
      const result = await deleteOrderAndRestockAction(orderId);
      if (result.success) {
        setOrders(prevOrders => prevOrders.filter(o => o.id !== orderId));
        toast({
          title: "Commande Supprimée",
          description: result.message,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      console.error("Error deleting order:", err);
      toast({
        title: "Erreur de Suppression",
        description: err.message || "Impossible de supprimer la commande.",
        variant: "destructive",
      });
    } finally {
      setDeletingOrderId(null);
    }
  }


  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'paid':
        return 'default';
      case 'shipped':
        return 'default';
      case 'delivered':
        return 'default'; // A different color could be used here e.g., success
      case 'cancelled':
      case 'refunded':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusText = (status: Order['status']) => {
    const statusMap = {
        pending: 'En attente',
        paid: 'Payée',
        shipped: 'Expédiée',
        delivered: 'Livrée',
        cancelled: 'Annulée',
        refunded: 'Remboursée'
    };
    return statusMap[status] || status;
  }
  
  if (authLoading || loading) {
    return (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-4 text-lg text-muted-foreground">Chargement des commandes...</p>
        </div>
      );
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Gestion des Commandes" 
        description="Consultez et mettez à jour le statut des commandes clients." 
      />
      
      {error && (
        <div className="p-12 text-center border-2 border-dashed border-destructive/50 rounded-lg bg-destructive/10">
          <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg text-destructive font-semibold">Une erreur est survenue</p>
          <p className="text-sm text-destructive/90 mt-2">{error}</p>
        </div>
      )}
      
      {!loading && !error && (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle>Toutes les Commandes ({orders.length})</CardTitle>
                <CardDescription>
                  Voici la liste de toutes les commandes passées sur la boutique.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {orders.length > 0 ? (
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[120px]">ID Commande</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right w-[120px]">Total</TableHead>
                            <TableHead className="w-[150px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                    {orders.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell className="font-mono text-xs">{order.id.substring(0, 8).toUpperCase()}</TableCell>
                            <TableCell>{order.orderDate instanceof Date ? order.orderDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date invalide'}</TableCell>
                            <TableCell>{order.shippingAddress?.fullName || order.userId.substring(0,10) + '...'}</TableCell>
                            <TableCell>
                                <Badge variant={getStatusVariant(order.status)}>
                                    {getStatusText(order.status)}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                                {typeof order.totalAmount === 'number'
                                ? `${order.totalAmount.toFixed(2)} DT`
                                : 'N/A'
                                }
                            </TableCell>
                            <TableCell className="text-right flex items-center justify-end gap-1">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon" title="Voir les détails"><Eye className="h-4 w-4" /></Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[625px]">
                                        <DialogHeader>
                                            <DialogTitle>Détails Commande #{order.id.substring(0, 8).toUpperCase()}</DialogTitle>
                                            <DialogDescription>
                                                Passée le {order.orderDate instanceof Date ? order.orderDate.toLocaleString('fr-FR') : 'Date invalide'} par {order.shippingAddress?.fullName}.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="font-semibold text-foreground mb-2">Adresse de livraison</h4>
                                                    <address className="not-italic text-sm text-muted-foreground">
                                                        {order.shippingAddress?.fullName}<br />
                                                        {order.shippingAddress?.addressLine1}<br />
                                                        {order.shippingAddress?.addressLine2 && <>{order.shippingAddress.addressLine2}<br /></>}
                                                        {order.shippingAddress?.postalCode} {order.shippingAddress?.city}<br />
                                                        {order.shippingAddress?.country}<br/>
                                                        Tél: {order.shippingAddress?.phoneNumber || 'Non fourni'}
                                                    </address>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-foreground mb-2">Actions Rapides</h4>
                                                    <div className="space-y-2">
                                                        <Button 
                                                            variant="secondary" 
                                                            className="w-full" 
                                                            disabled={updatingOrderId === order.id || !['pending', 'paid'].includes(order.status)}
                                                            onClick={() => handleUpdateStatus(order.id, 'shipped')}
                                                        >
                                                            {updatingOrderId === order.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Truck className="mr-2 h-4 w-4" />}
                                                            {updatingOrderId === order.id ? 'Mise à jour...' : 'Marquer Expédiée'}
                                                        </Button>
                                                        <Button 
                                                            variant="secondary" 
                                                            className="w-full" 
                                                            disabled={updatingOrderId === order.id || !['shipped'].includes(order.status)}
                                                            onClick={() => handleUpdateStatus(order.id, 'delivered')}
                                                        >
                                                            {updatingOrderId === order.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                                                            {updatingOrderId === order.id ? 'Mise à jour...' : 'Marquer Livrée'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-foreground mb-2">Articles Commandés</h4>
                                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                                                {order.items.map((item, index) => (
                                                    <li key={index}>
                                                        <span className="font-semibold text-foreground">{item.quantity} x {item.name}</span> ({item.color})
                                                        <span className="float-right font-medium text-foreground">{(item.priceAtPurchase * item.quantity).toFixed(2)} DT</span>
                                                    </li>
                                                ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" disabled={deletingOrderId === order.id} title="Supprimer la commande">
                                      {deletingOrderId === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Supprimer la commande ?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Cette action est irréversible. La commande <strong>#{order.id.substring(0, 8).toUpperCase()}</strong> sera supprimée et les articles seront remis en stock (sauf si déjà livrée).
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                                      <AlertDialogAction 
                                        className="bg-destructive hover:bg-destructive/90"
                                        onClick={() => handleDeleteOrder(order.id)}
                                        disabled={deletingOrderId === order.id}
                                      >
                                        {deletingOrderId === order.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Oui, supprimer
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
              ) : (
                <div className="p-12 text-center border-t border-dashed border-muted-foreground/30">
                  <p className="text-lg text-muted-foreground">Aucune commande n'a été trouvée.</p>
                  <p className="text-sm text-muted-foreground mt-2">Les nouvelles commandes apparaîtront ici dès qu'elles seront enregistrées.</p>
                </div>
              )}
            </CardContent>
        </Card>
      )}
    </div>
  );
}
