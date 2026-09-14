import React from 'react';
import type { Metadata } from 'next';
import { AuthProvider } from '@/context/AuthContext';
import { CivicDataProvider } from '@/context/CivicDataContext';
import NavigationShell from '@/components/NavigationShell';
import './globals.css';

export const metadata: Metadata = {
  title: 'CivicHelix // Triple-Helix Civic Problem-Solving Platform',
  description: 'Civic problem solving with role-based governance and Triple-Helix collaboration.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <AuthProvider>
          <CivicDataProvider>
            <NavigationShell>{children}</NavigationShell>
          </CivicDataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
