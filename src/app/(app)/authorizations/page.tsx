'use client';

import { useState, useMemo } from 'react';
import { useCareFlow } from '@/contexts/CareFlowContext';
import { PageHeader } from '@/components/app/page-header';
import { DataTable, ColumnDef } from '@/components/app/data-table';
import { Pagination } from '@/components/app/pagination';
import type { Authorization } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const getStatusBadgeClass = (status: Authorization['status']) => {
  switch (status) {
    case 'Active':
      return 'badge-success';
    case 'Pending':
      return 'badge-warning';
    case 'Expired':
    default:
      return 'badge-danger';
  }
};

const columns: ColumnDef<Authorization>[] = [
  {
    accessorKey: 'clientName',
    header: 'Client',
    cell: (row) => row.clientName,
  },
  {
    accessorKey: 'servicePlan',
    header: 'Service Plan',
    cell: (row) => (
       <div>
        <p className="font-medium">{row.servicePlan}</p>
        <p className="text-xs text-muted-foreground">{row.serviceType} ({row.billingCode})</p>
       </div>
    ),
  },
  {
    accessorKey: 'authorizedHours',
    header: 'Hour Usage',
    cell: (row) => {
        const percentage = row.authorizedHours > 0 ? (row.usedHours / row.authorizedHours) * 100 : 0;
        return (
            <div className="min-w-[120px]">
                <div className="text-sm font-medium text-foreground">{row.usedHours} / {row.authorizedHours} hrs</div>
                <Progress value={percentage} className="h-2 mt-1" />
            </div>
        )
    },
  },
  {
    accessorKey: 'startDate',
    header: 'Authorization Period',
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

export default function AuthorizationsPage() {
  const { authorizations, openModal } = useCareFlow();
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return authorizations.slice(start, start + ITEMS_PER_PAGE);
  }, [authorizations, currentPage]);

  return (
    <div className="space-y-6">
      <PageHeader title="Authorizations" breadcrumbs={[{ name: 'Service Management' }, { name: 'Authorizations' }]} />
      
      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={paginatedData}
            onView={(row) => openModal('view', 'authorizations', row)}
            onEdit={(row) => openModal('edit', 'authorizations', row)}
            onDelete={(row) => openModal('delete', 'authorizations', row)}
          />

          <Pagination
            currentPage={currentPage}
            totalItems={authorizations.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
