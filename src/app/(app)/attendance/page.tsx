'use client';

import { useState, useMemo } from 'react';
import { useCareFlow } from '@/contexts/CareFlowContext';
import { PageHeader } from '@/components/app/page-header';
import { DataTable, ColumnDef } from '@/components/app/data-table';
import { Pagination } from '@/components/app/pagination';
import type { Attendance } from '@/lib/types';

const columns: ColumnDef<Attendance>[] = [
  {
    accessorKey: 'clientName',
    header: 'Client',
    cell: (row) => row.clientName,
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: (row) => row.date,
  },
  {
    accessorKey: 'checkIn',
    header: 'Check In',
    cell: (row) => row.checkIn,
  },
  {
    accessorKey: 'checkOut',
    header: 'Check Out',
    cell: (row) => row.checkOut,
  },
   {
    accessorKey: 'duration',
    header: 'Duration',
    cell: (row) => row.duration,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (row) => <span className={`badge ${row.status === 'Present' ? 'badge-success' : row.status.includes('Departure') || row.status.includes('Arrival') ? 'badge-warning' : 'badge-danger'}`}>{row.status}</span>,
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: () => null,
  },
];

const ITEMS_PER_PAGE = 8;

export default function AttendancePage() {
  const { attendance, openModal } = useCareFlow();
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return attendance.slice(start, start + ITEMS_PER_PAGE);
  }, [attendance, currentPage]);

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" breadcrumbs={[{ name: 'Attendance' }]} />
      
      <DataTable
        columns={columns}
        data={paginatedData}
        onView={(row) => openModal('view', 'attendance', row)}
        onEdit={(row) => openModal('edit', 'attendance', row)}
        onDelete={(row) => openModal('delete', 'attendance', row)}
      />

      <Pagination
        currentPage={currentPage}
        totalItems={attendance.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
