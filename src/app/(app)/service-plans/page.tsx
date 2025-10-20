'use client';

import { useState, useMemo } from 'react';
import { useCareFlow } from '@/contexts/CareFlowContext';
import { PageHeader } from '@/components/app/page-header';
import { DataTable, ColumnDef } from '@/components/app/data-table';
import { Pagination } from '@/components/app/pagination';
import type { ServicePlan, PlanStatus } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const getStatusBadgeClass = (status: PlanStatus) => {
  switch (status) {
    case 'Active':
      return 'badge-success';
    case 'Pending':
      return 'badge-warning';
    case 'Expired':
    case 'Inactive':
    default:
      return 'badge-danger';
  }
};

const columns: ColumnDef<ServicePlan>[] = [
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
    cell: (row) => <span className={cn('badge', getStatusBadgeClass(row.status))}>{row.status}</span>,
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
