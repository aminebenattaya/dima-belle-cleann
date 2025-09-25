
'use client';

import Link from 'next/link';
import { ShoppingBag, Menu, User, LogOut, LogIn, UserPlus, LayoutDashboard, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader, SheetClose } from '@/components/ui/sheet';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Accueil' },
  { href: '/products', label: 'Collection' },
  { href: '/style-assistant', label: 'Conseillère IA', icon: Sparkles },
  { href: '/customer-gallery', label: 'Galerie' },
  { href: '/blog', label: 'Blog' },
];

export default function Header() {
  const { isUserLoggedIn, isAdmin, loading, user } = useAuthStatus();
  const router = useRouter();
  const pathname = usePathname();
  const { items } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/');
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const renderAuthButtons = (isMobile = false) => {
    if (loading) {
      return <div className="text-sm text-muted-foreground px-3 py-2">Chargement...</div>;
    }

    const adminButton = (
        <Button variant="outline" asChild className={isMobile ? "w-full text-left justify-start py-2 text-lg" : ""}>
            <Link href="/amineweldmaryem"><LayoutDashboard className="mr-2 h-4 w-4" />Admin</Link>
        </Button>
    );

    const profileButton = (
      <Button variant={isMobile ? "ghost" : "ghost"} asChild className={isMobile ? "w-full text-left justify-start py-2 text-lg" : ""}>
        <Link href="/profile"><User className="mr-2 h-4 w-4" />Profil</Link>
      </Button>
    );

    const logoutButton = (
      <Button variant={isMobile ? "destructive" : "outline"} onClick={handleLogout} className={isMobile ? "w-full text-left justify-start py-2 text-lg" : ""}>
        <LogOut className="mr-2 h-4 w-4" />Déconnexion
      </Button>
    );
    
    const loginButton = (
      <Button variant="ghost" asChild className={isMobile ? "w-full text-left justify-start py-2 text-lg" : ""}>
        <Link href="/login"><LogIn className="mr-2 h-4 w-4" />Connexion</Link>
      </Button>
    );

    const registerButton = (
      <Button variant="default" asChild className={isMobile ? "w-full text-left justify-start py-2 text-lg" : ""}>
        <Link href="/register"><UserPlus className="mr-2 h-4 w-4" />Inscription</Link>
      </Button>
    );

    if (isUserLoggedIn) {
      return (
        <>
          {isAdmin && (isMobile ? <SheetClose asChild>{adminButton}</SheetClose> : adminButton)}
          {isMobile ? <SheetClose asChild>{profileButton}</SheetClose> : profileButton}
          {isMobile ? <SheetClose asChild>{logoutButton}</SheetClose> : logoutButton}
        </>
      );
    }
    
    return (
      <>
        {isMobile ? <SheetClose asChild>{loginButton}</SheetClose> : loginButton}
        {isMobile ? <SheetClose asChild>{registerButton}</SheetClose> : registerButton}
      </>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary" style={{ fontFamily: 'var(--font-lora)'}}>
          Dima Belle
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "relative transition-colors hover:text-primary py-2",
                pathname === item.href ? "text-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary" : "text-muted-foreground"
              )}
            >
              {item.icon && <item.icon className="mr-1.5 h-4 w-4 inline-block text-accent"/>}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-2 md:space-x-4">
           <div className="hidden md:flex items-center space-x-2">
            {renderAuthButtons(false)}
          </div>
          <Button variant="ghost" size="icon" asChild aria-label="Panier">
             <Link href="/cart" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {isMounted && totalItems > 0 && (
                 <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {totalItems}
                  </Badge>
              )}
             </Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Ouvrir le menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-background p-6 flex flex-col">
              <SheetHeader>
                <SheetClose asChild>
                  <SheetTitle asChild>
                      <Link href="/" className="text-xl font-bold text-primary mb-4 text-left">
                      Dima Belle
                      </Link>
                  </SheetTitle>
                </SheetClose>
              </SheetHeader>
              <nav className="flex flex-col space-y-3 flex-grow">
                {navItems.map((item) => (
                  <SheetClose asChild key={item.label}>
                    <Link
                      href={item.href}
                      className="text-lg transition-colors hover:text-primary py-2 border-b border-border/20"
                    >
                      {item.icon && <item.icon className="mr-2 h-4 w-4 inline-block text-accent"/>}
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto border-t border-border/40 pt-4 space-y-2">
                {renderAuthButtons(true)}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
