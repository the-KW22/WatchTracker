import React from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {children}
      </main>
      
      {/* Background Decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[hsl(var(--accent))] rounded-full blur-[128px] opacity-20"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[hsl(var(--accent))] rounded-full blur-[128px] opacity-20"></div>
      </div>
    </div>
  );
};