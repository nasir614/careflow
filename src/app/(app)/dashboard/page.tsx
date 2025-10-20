'use client';

import { Users, UserCog, ClipboardCheck, DollarSign } from 'lucide-react';
import { StatCard } from '@/components/app/stat-card';
import { useCareFlow } from '@/contexts/CareFlowContext';
import { PageHeader } from '@/components/app/page-header';

export default function DashboardPage() {
  const { clients, staff, attendance, billing } = useCareFlow();

  const totalRevenue = billing.reduce((acc, b) => acc + b.amount, 0);

  const stats = [
    { title: 'Active Clients', value: clients.filter(c => c.status === 'active').length, icon: Users, colorClass: 'from-blue-500/10' },
    { title: 'Active Staff', value: staff.filter(s => s.status === 'Active').length, icon: UserCog, colorClass: 'from-purple-500/10' },
    { title: 'Today\'s Attendance', value: attendance.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).length, icon: ClipboardCheck, colorClass: 'from-green-500/10' },
    { title: 'Total Revenue', value: `$${(totalRevenue / 1000).toFixed(1)}K`, icon: DollarSign, colorClass: 'from-orange-500/10' }
  ];

  return (
    <>
      <PageHeader title="Dashboard" breadcrumbs={[{ name: 'Dashboard' }]} />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(stat => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            colorClass={stat.colorClass}
          />
        ))}
      </div>
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Placeholder for future charts or widgets */}
          <div className="bg-card rounded-lg border p-6 min-h-[300px] flex items-center justify-center">
              <p className="text-muted-foreground">Compliance Overview Chart</p>
          </div>
          <div className="bg-card rounded-lg border p-6 min-h-[300px] flex items-center justify-center">
              <p className="text-muted-foreground">Upcoming Schedules</p>
          </div>
      </div>
    </>
  );
}
