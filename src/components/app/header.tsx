'use client';

import { Search, Bell, Plus } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCareFlow } from '@/contexts/CareFlowContext';
import { DataModule } from '@/lib/types';

export function Header({
  searchTerm,
  setSearchTerm,
}: {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}) {
  const { openModal } = useCareFlow();
  const pathname = usePathname();

  const getModuleFromPath = (): DataModule | null => {
    const path = pathname.split('/').pop();
    if (['clients', 'staff', 'schedules', 'attendance', 'compliance', 'billing', 'transportation'].includes(path as string)) {
      return path as DataModule;
    }
    return null;
  }
  
  const activeModule = getModuleFromPath();

  const handleAddNew = () => {
    if (activeModule) {
      openModal('add', activeModule);
    }
  };

  const canAdd = activeModule && activeModule !== 'dashboard' && activeModule !== 'reports';

  return (
    <header className="bg-card border-b px-6 py-3 no-print">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-xl relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search clients, staff, schedules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-muted/50 border-transparent rounded-lg text-sm focus:bg-background focus:border-primary/50 focus:ring-primary/50"
          />
        </div>
        <div className="flex items-center gap-2">
          {canAdd && (
             <Button onClick={handleAddNew}>
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
          )}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-destructive rounded-full border-2 border-card"></span>
            <span className="sr-only">Notifications</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
