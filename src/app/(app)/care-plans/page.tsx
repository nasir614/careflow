'use client';

import { useState, useMemo } from 'react';
import { useCareFlow } from '@/contexts/CareFlowContext';
import { PageHeader } from '@/components/app/page-header';
import { DataTable, ColumnDef } from '@/components/app/data-table';
import { Pagination } from '@/components/app/pagination';
import type { CarePlan } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const getStatusBadgeClass = (status: CarePlan['status']) => {
  switch (status) {
    case 'Active':
      return 'badge-success';
    case 'On-Hold':
      return 'badge-warning';
    case 'Completed':
    default:
      return 'badge-info';
  }
};

const columns: ColumnDef<CarePlan>[] = [
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
