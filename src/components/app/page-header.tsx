import { Home, ChevronRight } from "lucide-react";
import Link from 'next/link';

interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  children?: React.ReactNode;
}

export function PageHeader({ title, breadcrumbs, children }: PageHeaderProps) {
  return (
    <div className="mb-6 print:hidden">
      <nav aria-label="Breadcrumb" className="mb-2">
        <ol className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
          <li>
            <Link href="/dashboard" className="flex items-center gap-1.5 hover:text-foreground">
              <Home className="w-4 h-4" />
            </Link>
          </li>
          {breadcrumbs.map((item, index) => (
            <li key={index} className="flex items-center gap-1.5">
              <ChevronRight className="w-4 h-4" />
              {item.href ? (
                <Link href={item.href} className="hover:text-foreground">
                  {item.name}
                </Link>
              ) : (
                <span className="font-medium text-foreground">{item.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">{title}</h1>
        <div className="flex items-center gap-2">
            {children}
        </div>
      </div>
    </div>
  );
}
