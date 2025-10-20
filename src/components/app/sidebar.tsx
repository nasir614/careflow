'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, ClipboardCheck, FileCheck, DollarSign, Bus, UserCog, BarChart3,
  Settings, LogOut, Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Schedules', href: '/schedules', icon: Calendar },
  { name: 'Staff', href: '/staff', icon: UserCog },
  { name: 'Attendance', href: '/attendance', icon: ClipboardCheck },
  { name: 'Compliance', href: '/compliance', icon: FileCheck },
  { name: 'Billing', href: '/billing', icon: DollarSign },
  { name: 'Transportation', href: '/transportation', icon: Bus },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card border-r flex flex-col no-print">
      <div className="p-4 border-b">
        <Link href="/dashboard" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center text-primary-foreground font-headline text-lg">
            CF
          </div>
          <div>
            <div className="font-headline text-lg leading-tight text-foreground">CareFlow</div>
            <div className="text-xs text-muted-foreground">Sunrise Care</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <TooltipProvider>
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Tooltip key={item.name}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-md font-medium transition-colors text-sm',
                    isActive
                      ? 'bg-accent/50 text-accent-foreground'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{item.name}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
        </TooltipProvider>
      </nav>

      <div className="p-3 border-t space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground font-medium text-sm">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-destructive/80 hover:bg-destructive/10 hover:text-destructive font-medium text-sm">
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
