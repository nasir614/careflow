'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  Calendar,
  ClipboardList,
  Bus,
  ShieldCheck,
  Receipt,
  Settings,
  BarChart3,
  UserCog,
  X,
  FileHeart,
  UserCheck,
  FileCheck2,
  HeartHandshake
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet"

const navGroups = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
      { name: 'Reports', href: '/reports', icon: BarChart3 },
    ],
  },
  {
    title: 'Clients & Care',
    items: [
      { name: 'Clients', href: '/clients', icon: Users },
      { name: 'Schedules', href: '/schedules', icon: Calendar },
      { name: 'Attendance', href: '/attendance', icon: ClipboardList },
      { name: 'Transportation', href: '/transportation', icon: Bus },
    ],
  },
  {
    title: 'Service Management',
    items: [
      { name: 'Service Plans', href: '/service-plans', icon: FileHeart },
      { name: 'Care Plans', href: '/care-plans', icon: HeartHandshake },
      { name: 'Authorizations', href: '/authorizations', icon: FileCheck2 },
    ],
  },
  {
    title: 'Staff Management',
    items: [{ name: 'Staff', href: '/staff', icon: UserCog }],
  },
  {
    title: 'Billing & Compliance',
    items: [
      { name: 'Billing', href: '/billing', icon: Receipt },
      { name: 'Compliance', href: '/compliance', icon: ShieldCheck },
    ],
  },
];


const NavItem = ({ item, pathname, onClick }: { item: { name: string; href: string; icon: React.ElementType }; pathname: string, onClick?: () => void }) => {
  const isActive = pathname.startsWith(item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 text-sm font-medium',
        isActive && 'bg-primary/10 text-primary'
      )}
    >
      <Icon className="w-5 h-5" />
      <span>{item.name}</span>
    </Link>
  );
};

const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => {
    const pathname = usePathname();
    return (
        <>
            <div className="flex items-center p-4 border-b h-16">
                <div className="h-8 w-8 bg-gradient-to-br from-rose-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-white" />
                </div>
                <h2 className="ml-3 text-xl font-bold font-display text-foreground">
                CareFlow
                </h2>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
                {navGroups.map((group) => (
                <div key={group.title} className="mb-2">
                    <h4 className="text-xs uppercase font-semibold text-muted-foreground mb-2 tracking-wide px-3">{group.title}</h4>
                    <div className="space-y-1">
                    {group.items.map((item) => (
                        <NavItem key={item.name} item={item} pathname={pathname} onClick={onLinkClick} />
                    ))}
                    </div>
                </div>
                ))}
            </nav>

            <div className="border-t p-3">
                <a href="#" className="flex items-center gap-2 p-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition">
                <Settings className="h-5 w-5" /> Settings
                </a>
            </div>
        </>
    );
};


export function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (open: boolean) => void }) {
  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent 
              side="left" 
              className="lg:hidden w-72 bg-card p-0 m-0 border-r h-full flex flex-col"
          >
              <SidebarContent onLinkClick={() => setIsOpen(false)} />
          </SheetContent>
      </Sheet>
      
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-card border-r flex-col no-print hidden lg:flex">
        <SidebarContent />
      </aside>
    </>
  );
}
