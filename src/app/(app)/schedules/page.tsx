'use client';

import { useState, useMemo } from 'react';
import { useCareFlow } from '@/contexts/CareFlowContext';
import { PageHeader } from '@/components/app/page-header';
import { DataTable, ColumnDef } from '@/components/app/data-table';
import { Pagination } from '@/components/app/pagination';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Bot, CalendarDays } from 'lucide-react';
import type { Schedule } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const getStatusBadgeClass = (status: Schedule['status']) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-700';
    case 'pending':
      return 'bg-yellow-100 text-yellow-700';
    case 'expired':
    default:
      return 'bg-red-100 text-red-700';
  }
};

const dayAbbreviations: { [key: string]: string } = {
  monday: 'M',
  tuesday: 'T',
  wednesday: 'W',
  thursday: 'Th',
  friday: 'F',
  saturday: 'Sa',
  sunday: 'Su',
};
const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];


const columns: ColumnDef<Schedule>[] = [
  {
    accessorKey: 'clientName',
    header: 'Client',
    cell: (row) => row.clientName,
  },
  {
    accessorKey: 'staffName',
    header: 'Staff',
    cell: (row) => row.staffName,
  },
  {
    accessorKey: 'serviceType',
    header: 'Service',
    cell: (row) => row.serviceType,
  },
  {
    accessorKey: 'days',
    header: 'Service Days',
    cell: (row) => (
      <div className="flex gap-1">
        {allDays.map(day => {
          const isScheduled = Array.isArray(row.days) && row.days.map(d => d.toLowerCase()).includes(day);
          return (
            <div
              key={day}
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
                isScheduled ? 'bg-primary/20 text-primary' : 'bg-gray-100 text-gray-500'
              )}
              title={day.charAt(0).toUpperCase() + day.slice(1)}
            >
              {dayAbbreviations[day]}
            </div>
          );
        })}
      </div>
    ),
  },
  {
    accessorKey: 'usedUnits',
    header: 'Unit Usage',
    cell: (row) => {
        const percentage = row.totalUnits > 0 ? (row.usedUnits / row.totalUnits) * 100 : 0;
        return (
            <div className="min-w-[120px]">
                <div className="text-sm font-medium text-foreground">{row.usedUnits} / {row.totalUnits}</div>
                <Progress value={percentage} className="h-2 mt-1" />
            </div>
        )
    },
  },
   {
    accessorKey: 'startDate',
    header: 'Period',
    cell: (row) => <div className="text-xs min-w-[80px]">{row.startDate}<br />to {row.endDate}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (row) => <span className={cn('badge', getStatusBadgeClass(row.status))}>{row.status}</span>,
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: () => null,
  },
];


const servicePlanColumns: ColumnDef<Schedule>[] = [
  {
    accessorKey: 'clientName',
    header: 'Client',
    cell: (row) => row.clientName,
  },
  {
    accessorKey: 'serviceCode',
    header: 'Service Code',
    cell: (row) => row.serviceCode,
  },
  {
    accessorKey: 'frequency',
    header: 'Frequency',
    cell: (row) => row.frequency,
  },
  {
    accessorKey: 'days',
    header: 'Service Days (AM/PM)',
    cell: (row) => (
      <div className="flex gap-2">
        {allDays.map(day => {
          const isScheduled = Array.isArray(row.days) && row.days.map(d => d.toLowerCase()).includes(day);
          return (
            <div key={day} className="flex flex-col items-center">
              <div className="text-xs text-muted-foreground">{day.charAt(0).toUpperCase() + day.slice(1,3)}</div>
              <div className={cn('flex h-5 w-5 mt-1 items-center justify-center rounded-sm text-xs font-bold', isScheduled ? 'bg-blue-100 text-blue-700' : 'bg-gray-100')}>
                {isScheduled ? '✓' : '-'}
              </div>
            </div>
          );
        })}
      </div>
    ),
  },
  {
    accessorKey: 'endDate',
    header: 'End Date',
    cell: (row) => row.endDate,
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: () => null,
  },
];

const ITEMS_PER_PAGE = 8;
const SERVICE_PLANS_PER_PAGE = 5;

export default function SchedulesPage() {
  const { schedules, openModal } = useCareFlow();
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPlansPage, setCurrentPlansPage] = useState(1);

  const activeSchedules = useMemo(() => schedules.filter(s => s.status !== 'expired'), [schedules]);
  const pastSchedules = useMemo(() => schedules.filter(s => s.status === 'expired'), [schedules]);

  const paginatedSchedules = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return activeSchedules.slice(start, start + ITEMS_PER_PAGE);
  }, [activeSchedules, currentPage]);

  const paginatedServicePlans = useMemo(() => {
    const start = (currentPlansPage - 1) * SERVICE_PLANS_PER_PAGE;
    return pastSchedules.slice(start, start + SERVICE_PLANS_PER_PAGE);
  }, [pastSchedules, currentPlansPage]);
  
  return (
    <div className="space-y-8">
      <PageHeader title="Schedules" breadcrumbs={[{ name: 'Schedules' }]}>
      </PageHeader>
      
      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={paginatedSchedules}
            onView={(row) => openModal('view', 'schedules', row)}
            onEdit={(row) => openModal('edit', 'schedules', row)}
            onDelete={(row) => openModal('delete', 'schedules', row)}
          />

          <Pagination
            currentPage={currentPage}
            totalItems={activeSchedules.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <CalendarDays className="w-6 h-6 text-primary" />
            Service Plans (Past Schedules)
          </CardTitle>
        </CardHeader>
        <CardContent>
           <DataTable
              columns={servicePlanColumns}
              data={paginatedServicePlans}
              onView={(row) => openModal('view', 'schedules', row)}
              onEdit={(row) => openModal('edit', 'schedules', row)}
              onDelete={(row) => openModal('delete', 'schedules', row)}
            />
            <Pagination
              currentPage={currentPlansPage}
              totalItems={pastSchedules.length}
              itemsPerPage={SERVICE_PLANS_PER_PAGE}
              onPageChange={setCurrentPlansPage}
            />
        </CardContent>
      </Card>
    </div>
  );
}

    