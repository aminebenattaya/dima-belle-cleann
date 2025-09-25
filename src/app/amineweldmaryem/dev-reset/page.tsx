'use client';

import { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, AlertTriangle, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { resetTestDataAction, resetAnalyticsAction } from '@/app/actions/devActions';
import { useRouter } from 'next/navigation';

export default function DevResetPage() {
  const [isResettingAll, setIsResettingAll] = useState(false);
  const [isResettingAnalytics, setIsResettingAnalytics] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleResetAnalytics = async () => {
    setIsResettingAnalytics(true);
    try {
      const result = await resetAnalyticsAction();
      if (result.success) {
        toast({
          title: "Statistiques Réinitialisées",
          description: result.message,
        });
        router.push('/amineweldmaryem/statistics');
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error("Error during analytics reset:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue.",
        variant: "destructive",
      });
    } finally {
      setIsResettingAnalytics(false);
    }
  };

  const handleResetAllData = async () => {
    setIsResettingAll(true);
    try {
      const result = await resetTestDataAction();
      if (result.success) {
        toast({
          title: "Réinitialisation Totale Réussie",
          description: result.message,
        });
        router.push('/amineweldmaryem');
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error("Error during all data reset:", error);
      toast({
        title: "Erreur de Réinitialisation",
        description: error.message || "Une erreur est survenue.",
        variant: "destructive",
      });
    } finally {
      setIsResettingAll(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <PageHeader 
        title="Centre de Contrôle et Réinitialisation"
        description="Outils pour la maintenance et la réinitialisation des données de la boutique."
      />

      <Card>
        <CardHeader>
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10 flex items-center justify-center">
                    <RotateCcw className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <CardTitle>Réinitialiser les Statistiques</CardTitle>
                    <CardDescription>Remettez à zéro les statistiques de vente sans supprimer les commandes.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
             <p>
                Cette action supprimera le document des statistiques (`salesAnalytics`). Les calculs de revenus, le nombre de commandes livrées, et les produits les plus vendus seront réinitialisés.
            </p>
            <p className="font-semibold text-foreground">
                Ceci ne supprime PAS les commandes existantes. Les statistiques recommenceront à être calculées à partir de la prochaine commande marquée comme "livrée".
            </p>
        </CardContent>
         <CardFooter>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button 
                        variant="secondary"
                        disabled={isResettingAnalytics}
                    >
                        {isResettingAnalytics ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Réinitialisation en cours...</>
                        ) : (
                        'Réinitialiser Uniquement les Statistiques'
                        )}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Réinitialiser les statistiques ?</AlertDialogTitle>
                    <AlertDialogDescription>
                    Êtes-vous sûr(e) ? Toutes les données analytiques seront effacées. Cette action est irréversible mais ne touchera pas à vos commandes.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isResettingAnalytics}>Annuler</AlertDialogCancel>
                    <AlertDialogAction 
                    onClick={handleResetAnalytics}
                    disabled={isResettingAnalytics}
                    >
                    {isResettingAnalytics && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Oui, réinitialiser les statistiques
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </CardFooter>
      </Card>
      
      <Card className="border-destructive">
        <CardHeader>
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                    <CardTitle className="text-destructive">Réinitialiser Toutes les Données de Test</CardTitle>
                    <CardDescription>Supprimez toutes les commandes et réinitialisez les statistiques.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
                Ceci est une action <strong className="text-foreground">destructive</strong>. Elle va définitivement <strong className="text-foreground">supprimer toutes les commandes</strong> et <strong className="text-foreground">réinitialiser toutes les statistiques de ventes</strong> de votre base de données.
            </p>
            <p>
                Utilisez cette fonction uniquement avant le lancement officiel pour nettoyer les données de test.
            </p>
        </CardContent>
        <CardFooter>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                <Button 
                    variant="destructive" 
                    disabled={isResettingAll}
                >
                    {isResettingAll ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Suppression en cours...</>
                    ) : (
                    'Supprimer Commandes & Statistiques'
                    )}
                </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirmer la réinitialisation totale ?</AlertDialogTitle>
                    <AlertDialogDescription>
                    Êtes-vous absolument sûr(e) ? Toutes les commandes et les statistiques seront supprimées de façon permanente. Cette action ne peut pas être annulée.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isResettingAll}>Annuler</AlertDialogCancel>
                    <AlertDialogAction 
                    className="bg-destructive hover:bg-destructive/90"
                    onClick={handleResetAllData}
                    disabled={isResettingAll}
                    >
                    {isResettingAll && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Oui, tout supprimer
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </CardFooter>
      </Card>

    </div>
  );
}
