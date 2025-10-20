'use client';

import { Search, Bell, Plus, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCareFlow } from '@/contexts/CareFlowContext';
import { DataModule } from '@/lib/types';

export function Header({
  searchTerm,
  setSearchTerm,
  onMenuClick,
}: {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onMenuClick: () => void;
}) {
  const { openModal } = useCareFlow();
  const pathname = usePathname();

  const getModuleFromPath = (): DataModule | null => {
    const path = pathname.split('/').pop();
    if (['clients', 'staff', 'schedules', 'attendance', 'compliance', 'billing', 'transportation', 'staffCredentials'].includes(path as string)) {
      if (path === 'staff') return 'staff';
      return path as DataModule;
    }
    return null;
  }
  
  const activeModule = getModuleFromPath();

  const handleAddNew = () => {
    if (activeModule) {
      const moduleToAdd = activeModule === 'staff' ? 'staffCredentials' : activeModule;
      openModal('add', moduleToAdd);
    }
  };

  const canAdd = activeModule && activeModule !== 'dashboard' && activeModule !== 'reports';

  return (
    <header className="bg-background/95 backdrop-blur-sm px-4 sm:px-6 h-16 flex items-center justify-between sticky top-0 z-30 no-print border-b">
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
                <Menu className="w-6 h-6" />
                <span className="sr-only">Open Menu</span>
            </Button>
            <div className="flex-1 max-w-md relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search anything..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border-input rounded-lg text-sm focus:border-primary/50 focus:ring-primary/50"
              />
            </div>
        </div>
        <div className="flex items-center gap-2">
          {canAdd && (
             <Button onClick={handleAddNew} className='bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg shadow hover:opacity-90 transition hidden sm:flex'>
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
          )}
           {canAdd && (
             <Button size="icon" onClick={handleAddNew} className='bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-full shadow hover:opacity-90 transition flex sm:hidden'>
              <Plus className="w-5 h-5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="relative rounded-full text-muted-foreground hover:bg-accent/20">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-destructive rounded-full border-2 border-background"></span>
            <span className="sr-only">Notifications</span>
          </Button>
        </div>
    </header>
  );
}
