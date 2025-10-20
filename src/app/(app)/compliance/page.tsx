'use client';

import { useState, useMemo } from 'react';
import { useCareFlow } from '@/contexts/CareFlowContext';
import { PageHeader } from '@/components/app/page-header';
import { DataTable, ColumnDef } from '@/components/app/data-table';
import { Pagination } from '@/components/app/pagination';
import type { Compliance } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';

const columns: ColumnDef<Compliance>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: (row) => `COMP-${row.id}`,
  },
  {
    accessorKey: 'client',
    header: 'Client',
    cell: (row) => row.client,
  },
  {
    accessorKey: 'item',
    header: 'Item',
    cell: (row) => (
      <div>
        <div className="font-medium">{row.item}</div>
        <div className="text-xs text-muted-foreground">{row.type}</div>
      </div>
    ),
  },
  {
    accessorKey: 'dueDate',
    header: 'Due Date',
    cell: (row) => row.dueDate,
  },
  {
    accessorKey: 'daysLeft',
    header: 'Days Left',
    cell: (row) => <span className={row.daysLeft < 0 ? 'text-destructive' : row.daysLeft < 15 ? 'text-yellow-600' : ''}>{row.daysLeft}</span>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (row) => <span className={`badge ${row.status === 'Current' ? 'badge-success' : row.status === 'Expired' ? 'badge-danger' : 'badge-warning'}`}>{row.status}</span>,
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: () => null,
  },
];

const ITEMS_PER_PAGE = 8;

export default function CompliancePage() {
  const { compliance, openModal } = useCareFlow();
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return compliance.slice(start, start + ITEMS_PER_PAGE);
  }, [compliance, currentPage]);

  return (
    <div className="space-y-6">
      <PageHeader title="Compliance" breadcrumbs={[{ name: 'Compliance' }]} />
      
      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={paginatedData}
            onView={(row) => openModal('view', 'compliance', row)}
            onEdit={(row) => openModal('edit', 'compliance', row)}
            onDelete={(row) => openModal('delete', 'compliance', row)}
          />

          <Pagination
            currentPage={currentPage}
            totalItems={compliance.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
