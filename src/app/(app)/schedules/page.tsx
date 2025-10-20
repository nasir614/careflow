'use client';

import { useState, useMemo } from 'react';
import { useCareFlow } from '@/contexts/CareFlowContext';
import { PageHeader } from '@/components/app/page-header';
import { DataTable, ColumnDef } from '@/components/app/data-table';
import { Pagination } from '@/components/app/pagination';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import type { Schedule } from '@/lib/types';
import { optimizeCaregiverRoutes } from '@/ai/flows/optimize-caregiver-routes';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
                isScheduled ? 'bg-primary/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
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

const ITEMS_PER_PAGE = 8;

export default function SchedulesPage() {
  const { schedules, openModal, clients, staff } = useCareFlow();
  const [currentPage, setCurrentPage] = useState(1);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const { toast } = useToast();

  const paginatedSchedules = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return schedules.slice(start, start + ITEMS_PER_PAGE);
  }, [schedules, currentPage]);
  
  const handleOptimizeRoutes = async () => {
    setIsOptimizing(true);
    try {
      const caregiverSchedules = JSON.stringify(schedules.map(s => ({
        caregiverId: s.staffId,
        clientId: s.clientId,
        startTime: "09:00",
        endTime: "17:00",
      })));
      const clientPreferences = JSON.stringify(clients.map(c => ({
        clientId: c.id,
        preferredCaregiver: null,
        notes: "No specific preferences noted."
      })));
      const travelTimeMatrix = JSON.stringify({ "1-2": 15, "1-3": 25, "2-3": 20 });

      const result = await optimizeCaregiverRoutes({
          caregiverSchedules,
          clientPreferences,
          travelTimeMatrix
      });

      toast({
          title: "AI Optimization Complete",
          description: result.summary,
          duration: 9000,
      });

    } catch (error) {
      console.error("AI optimization failed:", error);
      toast({
          title: "AI Optimization Failed",
          description: "Could not optimize routes at this time.",
          variant: 'destructive',
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Schedules" breadcrumbs={[{ name: 'Schedules' }]}>
        <Button variant="outline" size="sm" onClick={handleOptimizeRoutes} disabled={isOptimizing}>
          <Bot className="w-4 h-4 mr-2" />
          {isOptimizing ? 'Optimizing...' : 'Optimize with AI'}
        </Button>
      </PageHeader>
      
      <DataTable
        columns={columns}
        data={paginatedSchedules}
        onView={(row) => openModal('view', 'schedules', row)}
        onEdit={(row) => openModal('edit', 'schedules', row)}
        onDelete={(row) => openModal('delete', 'schedules', row)}
      />

      <Pagination
        currentPage={currentPage}
        totalItems={schedules.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
