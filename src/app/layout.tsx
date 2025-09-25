import type { Metadata } from 'next';
import { Inter, Lora } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ClientLayout from '@/components/layout/ClientLayout';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
});

export const metadata: Metadata = {
  title: {
    default: 'Dima Belle',
    template: '%s | Dima Belle',
  },
  description: 'Découvrez Dima Belle : foulards, turbans et prêt-à-porter élégants pour la femme moderne.',
  keywords: ['mode modeste', 'hijab', 'foulards', 'turbans', 'Dima Belle'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${lora.variable}`}>
      <body className={`font-sans antialiased flex flex-col min-h-screen`}>
        {/* ClientLayout now only decides if Header/Footer should render, but doesn't render them itself */}
        <ClientLayout>
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
        </ClientLayout>
        <Toaster />
      </body>
    </html>
  );
}
