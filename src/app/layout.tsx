'use client';

import type { Metadata } from 'next';
import Link from 'next/link';
import { Leaf } from 'lucide-react';
import { usePathname } from 'next/navigation';

import './globals.css';
import { cn } from '@/lib/utils';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { SidebarNav } from '@/components/sidebar-nav';
import { Header } from '@/components/header';
import { ChatWidget } from '@/components/chat-widget';
import { FirebaseClientProvider } from '@/firebase';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const showAppShell = !['/login', '/signup'].includes(pathname);

  // Metadata can't be dynamically changed in a client component this way,
  // but we keep the structure for when it's moved back to a server component.
  // const metadata: Metadata = {
  //   title: 'SmartCart AI',
  //   description: 'Your intelligent shopping assistant.',
  // };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>SmartCart AI</title>
        <meta name="description" content="Your intelligent shopping assistant." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Poppins:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
        )}
      >
        <FirebaseClientProvider>
          {showAppShell ? (
            <SidebarProvider>
              <Sidebar>
                <SidebarHeader>
                  <Link href="/dashboard" className="flex items-center gap-2 p-4">
                    <Leaf className="h-7 w-7 text-primary" />
                    <h1 className="text-xl font-headline font-semibold text-primary">
                      SmartCart AI
                    </h1>
                  </Link>
                </SidebarHeader>
                <SidebarContent>
                  <SidebarNav />
                </SidebarContent>
              </Sidebar>
              <div className="flex h-full flex-col">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                  {children}
                </main>
              </div>
              <ChatWidget />
            </SidebarProvider>
          ) : (
            <main>{children}</main>
          )}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
