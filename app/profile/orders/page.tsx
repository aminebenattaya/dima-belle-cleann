// src/app/profile/orders/page.tsx
'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useRouter } from 'next/navigation';
import { getOrdersForUser } from '@/services/orderService';
import type { Order } from '@/lib/types';
import { Loader2, Package, FileText, ArrowLeft, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function OrdersHistoryPage() {
    const { user, loading: authLoading, isUserLoggedIn } = useAuthStatus();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !isUserLoggedIn) {
            router.replace('/login?redirect=/profile/orders');
            return;
        }

        if (user) {
            const fetchOrders = async () => {
                setLoading(true);
                const userOrders = await getOrdersForUser(user.uid);
                setOrders(userOrders);
                setLoading(false);
            };
            fetchOrders();
        }
    }, [user, authLoading, isUserLoggedIn, router]);

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Chargement des commandes...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <PageHeader 
                    title="Mes Commandes" 
                    description="Retrouvez ici l'historique de tous vos achats."
                    className="text-left mb-0"
                />
                <Button variant="outline" asChild>
                    <Link href="/profile">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Retour au profil
                    </Link>
                </Button>
            </div>

            {orders.length === 0 ? (
                <Card className="text-center py-12">
                     <CardHeader>
                        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <CardTitle>Aucune commande pour le moment</CardTitle>
                        <CardDescription>
                            Votre historique est vide. Parcourez nos produits pour faire votre premier achat !
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/products">Commencer mes achats</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => (
                        <Card key={order.id} className="shadow-md">
                            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-muted/30 p-4">
                                <div>
                                    <CardTitle className="text-lg">Commande #{order.id.substring(0, 8).toUpperCase()}</CardTitle>
                                    <CardDescription>
                                        Passée le: {new Date(order.orderDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </CardDescription>
                                </div>
                                <Badge variant={order.status === 'pending' ? 'secondary' : 'default'} className="mt-2 sm:mt-0">
                                    {order.status === 'pending' ? 'En attente' : order.status}
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <div className="relative h-16 w-16 rounded-md overflow-hidden border bg-muted/30 flex-shrink-0">
                                            <Image src={item.imageUrl || "https://placehold.co/100x100.png"} alt={item.name} fill sizes="64px" className="object-contain" />
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-semibold">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">Couleur: {item.color}</p>
                                            <p className="text-sm text-muted-foreground">Quantité: {item.quantity}</p>
                                        </div>
                                        <p className="font-medium text-accent text-right">{(item.priceAtPurchase * item.quantity).toFixed(2)} DT</p>
                                    </div>
                                ))}
                                <Separator />
                                <div className="text-right">
                                    <p className="text-muted-foreground">Total de la commande : <span className="font-bold text-lg text-foreground">{order.totalAmount.toFixed(2)} DT</span></p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
