'use client';
import { useState } from 'react';
import { Sidebar } from '@/components/app/sidebar';
import { Header } from '@/components/app/header';
import { ModalManager } from '@/components/app/modals/modal-manager';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="flex h-screen bg-background font-body overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8" id="main-content">
          {/* Pass searchTerm to children if they need it */}
          {children}
        </main>
      </div>
      <ModalManager />
    </div>
  );
}
