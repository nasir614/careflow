'use client';

import { useState, useMemo } from 'react';
import { useCareFlow } from '@/contexts/CareFlowContext';
import { PageHeader } from '@/components/app/page-header';
import { DataTable, ColumnDef } from '@/components/app/data-table';
import { Pagination } from '@/components/app/pagination';
import type { EnrichedServicePlan, PlanStatus } from '@/lib/types';
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

const columns: ColumnDef<EnrichedServicePlan>[] = [
  {
    accessorKey: 'id',
    header: 'Plan ID',
    cell: (row) => `SP-${row.id}`,
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
    accessorKey: 'type',
    header: 'Type',
    cell: (row) => row.type,
  },
  {
    accessorKey: 'billingCode',
    header: 'Billing Code',
    cell: (row) => row.billingCode,
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

export default function ServicePlansPage() {
  const { servicePlans, openModal } = useCareFlow();
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return servicePlans.slice(start, start + ITEMS_PER_PAGE);
  }, [servicePlans, currentPage]);

  return (
    <div className="space-y-6">
      <PageHeader title="Service Plans" breadcrumbs={[{ name: 'Service Management' }, { name: 'Service Plans' }]} />
      
      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={paginatedData}
            onView={(row) => openModal('view', 'servicePlans', row)}
            onEdit={(row) => openModal('edit', 'servicePlans', row)}
            onDelete={(row) => openModal('delete', 'servicePlans', row)}
          />

          <Pagination
            currentPage={currentPage}
            totalItems={servicePlans.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
