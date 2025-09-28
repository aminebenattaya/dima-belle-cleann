import type { Metadata } from 'next';
import { Inter, Lora } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ClientLayout from '@/components/layout/ClientLayout';
import Script from 'next/script';

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
  const facebookAppId = "1348941259719682";

  return (
    <html lang="fr" className={`${inter.variable} ${lora.variable}`}>
      <body>
        <Script id="facebook-jssdk-init" strategy="afterInteractive">
          {`
            window.fbAsyncInit = function() {
              FB.init({
                appId: '${facebookAppId}',
                cookie: true,
                xfbml: true,
                version: 'v19.0'
              });
              FB.AppEvents.logPageView();
            };

            (function(d, s, id){
               var js, fjs = d.getElementsByTagName(s)[0];
               if (d.getElementById(id)) {return;}
               js = d.createElement(s); js.id = id;
               js.src = "https://connect.facebook.net/fr_FR/sdk.js";
               fjs.parentNode.insertBefore(js, fjs);
             }(document, 'script', 'facebook-jssdk'));
          `}
        </Script>
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
