'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, ClipboardCheck, FileCheck, DollarSign, Bus, UserCog, BarChart3,
  Settings, LogOut, Calendar, HeartHandshake
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';

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
    <aside className="w-60 bg-card border-r flex flex-col no-print">
      <div className="p-4 border-b">
        <Link href="/dashboard" className="flex items-center gap-2.5 p-2 rounded-lg">
          <HeartHandshake className="w-8 h-8 text-primary" />
          <div>
            <div className="font-bold text-lg leading-tight text-foreground">CareFlow</div>
            <div className="text-xs text-muted-foreground">Sunrise Care</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <TooltipProvider delayDuration={100}>
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Tooltip key={item.name}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-all text-sm relative',
                    isActive
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
                  )}
                >
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-primary rounded-r-full"></div>}
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

      <Separator className='mx-3' />

      <div className="p-3 mt-auto space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-muted-foreground hover:bg-secondary/70 hover:text-foreground font-medium text-sm">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-destructive/80 hover:bg-destructive/10 hover:text-destructive font-medium text-sm">
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>

      <Separator className='mx-3' />
      
      <div className='p-3'>
        <div className="flex items-center gap-3 p-2 rounded-lg">
            <Avatar>
                <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Admin" />
                <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div>
                <div className="font-medium text-sm">Admin User</div>
                <div className="text-xs text-muted-foreground">admin@careflow.com</div>
            </div>
        </div>
      </div>
    </aside>
  );
}
