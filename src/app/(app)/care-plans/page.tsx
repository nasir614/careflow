'use client';

import { useState, useMemo } from 'react';
import { useCareFlow } from '@/contexts/CareFlowContext';
import { PageHeader } from '@/components/app/page-header';
import { DataTable, ColumnDef } from '@/components/app/data-table';
import { Pagination } from '@/components/app/pagination';
import type { CarePlan, PlanStatus } from '@/lib/types';
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

const columns: ColumnDef<CarePlan>[] = [
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
    cell: (row) => <span className={cn('badge', getStatusBadgeClass(row.status))}>{row.status}</span>,
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
