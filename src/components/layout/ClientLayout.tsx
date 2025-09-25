'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isSpecialRoute = pathname.startsWith('/amineweldmaryem') || pathname === '/login' || pathname === '/unauthorized';

  // For admin, login, and unauthorized pages, we want a different root structure.
  // The admin layout provides its own structure with a sidebar.
  // The login and unauthorized pages are centered and don't need the standard header/footer.
  // In this case, we render only the {children} which will be the entire page component.
  if (isSpecialRoute) {
    return <>{children}</>;
  }

  // For all public pages, render the children which already include Header, main, and Footer from RootLayout.
  return <>{children}</>;
}
