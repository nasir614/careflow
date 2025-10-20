'use client';

import { useState, useMemo } from 'react';
import { useCareFlow } from '@/contexts/CareFlowContext';
import { PageHeader } from '@/components/app/page-header';
import { DataTable, ColumnDef } from '@/components/app/data-table';
import { Pagination } from '@/components/app/pagination';
import type { Billing } from '@/lib/types';

const columns: ColumnDef<Billing>[] = [
  {
    accessorKey: 'invoiceNo',
    header: 'Invoice #',
    cell: (row) => row.invoiceNo,
  },
  {
    accessorKey: 'client',
    header: 'Client',
    cell: (row) => row.client,
  },
  {
    accessorKey: 'serviceDate',
    header: 'Service Date',
    cell: (row) => row.serviceDate,
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: (row) => `$${row.amount.toFixed(2)}`,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (row) => <span className={`badge ${row.status === 'Paid' ? 'badge-success' : row.status === 'Approved' ? 'badge-info' : row.status === 'Denied' ? 'badge-danger' : 'badge-warning'}`}>{row.status}</span>,
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: () => null,
  },
];

const ITEMS_PER_PAGE = 8;

export default function BillingPage() {
  const { billing, openModal } = useCareFlow();
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return billing.slice(start, start + ITEMS_PER_PAGE);
  }, [billing, currentPage]);

  return (
    <div className="space-y-6">
      <PageHeader title="Billing" breadcrumbs={[{ name: 'Billing' }]} />
      
      <DataTable
        columns={columns}
        data={paginatedData}
        onView={(row) => openModal('view', 'billing', row)}
        onEdit={(row) => openModal('edit', 'billing', row)}
        onDelete={(row) => openModal('delete', 'billing', row)}
      />

      <Pagination
        currentPage={currentPage}
        totalItems={billing.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
