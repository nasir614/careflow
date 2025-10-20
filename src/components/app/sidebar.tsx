'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  FileCheck,
  DollarSign,
  Bus,
  UserCog,
  BarChart3,
  Settings,
  LogOut,
  Calendar,
  HeartHandshake,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';

const navGroups = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Reports', href: '/reports', icon: BarChart3 },
    ],
  },
  {
    title: 'Client Management',
    items: [
      { name: 'Clients', href: '/clients', icon: Users },
      { name: 'Schedules', href: '/schedules', icon: Calendar },
      { name: 'Attendance', href: '/attendance', icon: ClipboardCheck },
      { name: 'Transportation', href: '/transportation', icon: Bus },
    ],
  },
  {
    title: 'Staff Management',
    items: [{ name: 'Staff', href: '/staff', icon: UserCog }],
  },
  {
    title: 'Billing & Compliance',
    items: [
      { name: 'Billing', href: '/billing', icon: DollarSign },
      { name: 'Compliance', href: '/compliance', icon: FileCheck },
    ],
  },
];

const NavItem = ({ item, pathname }: { item: { name: string; href: string; icon: React.ElementType }; pathname: string }) => {
  const isActive = pathname.startsWith(item.href);
  const Icon = item.icon;
  return (
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
  );
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card border-r flex flex-col no-print">
      <div className="p-4 border-b">
        <Link href="/dashboard" className="flex items-center gap-2.5 p-2 rounded-lg">
          <HeartHandshake className="w-8 h-8 text-primary" />
          <div>
            <div className="font-bold text-lg leading-tight text-foreground">CareFlow</div>
            <div className="text-xs text-muted-foreground">Sunrise Care</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.title}>
            <h4 className="px-3 pb-1 text-xs uppercase font-semibold text-muted-foreground/80 tracking-wider">
              {group.title}
            </h4>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavItem key={item.name} item={item} pathname={pathname} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <Separator className="mx-3" />

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

      <Separator className="mx-3" />

      <div className="p-3">
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
