'use client';

import { useState, useMemo } from 'react';
import { useCareFlow } from '@/contexts/CareFlowContext';
import { PageHeader } from '@/components/app/page-header';
import { DataTable, ColumnDef } from '@/components/app/data-table';
import { Pagination } from '@/components/app/pagination';
import type { EnrichedCarePlan, PlanStatus } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';


const getStatusBadgeVariant = (status: PlanStatus) => {
  switch (status) {
    case 'Active':
      return 'default' as const;
    case 'Expired':
    case 'Inactive':
      return 'destructive' as const;
    case 'Pending':
    default:
      return 'secondary' as const;
  }
};

const columns: ColumnDef<EnrichedCarePlan>[] = [
  {
    accessorKey: 'id',
    header: 'Plan ID',
    cell: (row) => `CP-${row.id}`,
  },
  {
    accessorKey: 'clientName',
    header: 'Client',
    cell: (row) => row.clientName,
  },
  {
    accessorKey: 'planName',
    header: 'Plan Name',
    cell: (row) => row.planName,
  },
  {
    accessorKey: 'assignedStaff',
    header: 'Assigned Staff',
    cell: (row) => row.assignedStaff,
  },
  {
    accessorKey: 'startDate',
    header: 'Service Period',
    cell: (row) => <div className="text-xs">{row.startDate} to {row.endDate}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ status }) => <Badge variant={getStatusBadgeVariant(status)} className={cn(status === 'Active' && 'bg-green-500')}>{status}</Badge>,
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: () => null,
  },
];

const ITEMS_PER_PAGE = 10;

export default function CarePlansPage() {
  const { carePlans, openModal } = useCareFlow();
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return carePlans.slice(start, start + ITEMS_PER_PAGE);
  }, [carePlans, currentPage]);

  return (
    <div className="space-y-6">
      <PageHeader title="Care Plans" breadcrumbs={[{ name: 'Service Management' }, { name: 'Care Plans' }]} />
      
      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={paginatedData}
            onView={(row) => openModal('view', 'carePlans', row)}
            onEdit={(row) => openModal('edit', 'carePlans', row)}
            onDelete={(row) => openModal('delete', 'carePlans', row)}
          />

          <Pagination
            currentPage={currentPage}
            totalItems={carePlans.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
