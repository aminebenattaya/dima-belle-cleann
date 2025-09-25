// src/app/amineweldmaryem/layout.tsx
'use client'; 

import { useEffect } from 'react';
import { useAuthStatus } from '@/hooks/useAuthStatus'; 
import { useRouter } from 'next/navigation';
import * as Sidebar from '@/components/ui/sidebar';
import Link from 'next/link';
import { LayoutDashboard, Package, Archive, BarChartBig, Newspaper, Truck, Settings, LogOut, ShoppingBag, ShieldAlert, Loader2, Search, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase'; 

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoggedIn, isAdmin, loading } = useAuthStatus();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isUserLoggedIn) {
        router.replace('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
      } else if (user) {
        // **DEBUGGING STEP**: Log custom claims to the browser console.
        user.getIdTokenResult(true).then(idTokenResult => {
          console.log('%c[DEBUG] Firebase Auth Claims:', 'color: blue; font-weight: bold;', idTokenResult.claims);
          if (idTokenResult.claims.admin) {
            console.log('%c-> Claim "admin" trouvé:', 'color: green;', idTokenResult.claims.admin);
          } else {
            console.error('%c-> ERREUR: Claim "admin" NON trouvé sur le token.', 'color: red; font-weight: bold;');
            console.log('Assurez-vous que le custom claim a été correctement défini pour cet utilisateur et que vous vous êtes reconnecté depuis.');
          }
        });
      }
    }
  }, [user, isUserLoggedIn, isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Vérification de l'authentification...</p>
      </div>
    );
  }

  if (!isUserLoggedIn) {
    // Devrait être géré par la redirection, mais comme fallback ou pendant la redirection :
     return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Redirection vers la page de connexion...</p>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-8 text-center">
        <ShieldAlert className="h-24 w-24 text-destructive mb-6" />
        <h1 className="text-4xl font-bold text-primary mb-3">Accès Refusé</h1>
        <p className="text-lg text-muted-foreground max-w-md mb-6">
          Vous n'avez pas les permissions nécessaires pour accéder à cette section.
          Veuillez contacter l'administrateur si vous pensez qu'il s'agit d'une erreur.
        </p>
        <Button asChild>
          <Link href="/">Retour à l'accueil</Link>
        </Button>
         <Button variant="outline" onClick={() => auth.signOut().then(() => router.push('/login'))} className="mt-4">
          Se déconnecter et essayer avec un autre compte
        </Button>
      </div>
    );
  }

  // Si l'utilisateur est connecté et admin, afficher le layout normal
  return (
    <Sidebar.Provider defaultOpen>
      <div className="flex min-h-screen bg-background">
        <Sidebar.Root collapsible="icon" variant="sidebar" side="left">
          <Sidebar.Header className="p-4">
            <Link href="/amineweldmaryem" className="text-xl font-semibold text-primary flex items-center gap-2">
              <ShoppingBag className="h-7 w-7" />
              <span>Admin Dima Belle</span>
            </Link>
          </Sidebar.Header>
          <Sidebar.Content className="p-2 flex-grow">
            <Sidebar.Menu>
              <Sidebar.MenuItem>
                <Sidebar.MenuButton asChild tooltip={{ content: "Tableau de Bord", side: "right", align: "center" }}>
                  <Link href="/amineweldmaryem"><LayoutDashboard /><span>Tableau de Bord</span></Link>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
              <Sidebar.MenuItem>
                <Sidebar.MenuButton asChild tooltip={{ content: "Produits", side: "right", align: "center" }}>
                  <Link href="/amineweldmaryem/products"><Package /><span>Produits</span></Link>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
              <Sidebar.MenuItem>
                <Sidebar.MenuButton asChild tooltip={{ content: "Commandes", side: "right", align: "center" }}>
                  <Link href="/amineweldmaryem/orders"><Archive /><span>Commandes</span></Link>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
              <Sidebar.MenuItem>
                <Sidebar.MenuButton asChild tooltip={{ content: "Statistiques", side: "right", align: "center" }}>
                  <Link href="/amineweldmaryem/statistics"><BarChartBig /><span>Statistiques</span></Link>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
              <Sidebar.MenuItem>
                <Sidebar.MenuButton asChild tooltip={{ content: "Blog", side: "right", align: "center" }}>
                  <Link href="/amineweldmaryem/blog"><Newspaper /><span>Blog</span></Link>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
              <Sidebar.MenuItem>
                <Sidebar.MenuButton asChild tooltip={{ content: "Livraisons & Retours", side: "right", align: "center" }}>
                  <Link href="/amineweldmaryem/shipping-returns"><Truck /><span>Livraisons & Retours</span></Link>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            </Sidebar.Menu>
          </Sidebar.Content>
          <Sidebar.Footer className="p-2 border-t border-sidebar-border">
            <Sidebar.Menu>
                <Sidebar.MenuItem>
                  <Sidebar.MenuButton asChild tooltip={{ content: "Checklist SEO", side: "right", align: "center" }}>
                    <Link href="/amineweldmaryem/seo-checklist">
                      <CheckSquare /><span>Checklist SEO</span>
                    </Link>
                  </Sidebar.MenuButton>
                </Sidebar.MenuItem>
                <Sidebar.MenuItem>
                  <Sidebar.MenuButton asChild tooltip={{ content: "Performance de Recherche (Google)", side: "right", align: "center" }}>
                    <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">
                      <Search /><span>Search Console</span>
                    </a>
                  </Sidebar.MenuButton>
                </Sidebar.MenuItem>
                <Sidebar.MenuItem>
                    <Sidebar.MenuButton asChild tooltip={{ content: "Paramètres", side: "right", align: "center" }}>
                        <Link href="/amineweldmaryem/settings"><Settings /><span>Paramètres</span></Link>
                    </Sidebar.MenuButton>
                </Sidebar.MenuItem>
                 <Sidebar.MenuItem>
                    <Sidebar.MenuButton 
                        onClick={async () => {
                            await auth.signOut();
                            router.push('/'); // Redirige vers l'accueil après déconnexion
                        }} 
                        tooltip={{ content: "Déconnexion (Retour à l'accueil)", side: "right", align: "center" }}
                    >
                        <LogOut /><span>Déconnexion</span>
                    </Sidebar.MenuButton>
                </Sidebar.MenuItem>
            </Sidebar.Menu>
          </Sidebar.Footer>
        </Sidebar.Root>
        <Sidebar.Inset className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <div className="flex items-center justify-start mb-6 md:hidden"> {/* Show trigger only on mobile */}
            <Sidebar.Trigger /> 
          </div>
          {children}
        </Sidebar.Inset>
      </div>
    </Sidebar.Provider>
  );
}
