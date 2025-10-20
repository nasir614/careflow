'use client';

import { useState, useMemo } from 'react';
import { useCareFlow } from '@/contexts/CareFlowContext';
import { PageHeader } from '@/components/app/page-header';
import { DataTable, ColumnDef } from '@/components/app/data-table';
import { Pagination } from '@/components/app/pagination';
import type { Staff } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const columns: ColumnDef<Staff>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: (row) => (
        <div className="flex items-center gap-3">
            <Avatar>
                <AvatarImage src={row.avatarUrl} alt={row.name} />
                <AvatarFallback>{row.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
                <div className="font-medium">{row.name}</div>
                <div className="text-xs text-muted-foreground">{row.role}</div>
            </div>
        </div>
    ),
  },
  {
    accessorKey: 'phone',
    header: 'Contact',
    cell: (row) => row.phone,
  },
  {
    accessorKey: 'department',
    header: 'Department',
    cell: (row) => row.department,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (row) => <span className={`badge ${row.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>{row.status}</span>,
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: () => null,
  },
];

const ITEMS_PER_PAGE = 8;

export default function StaffPage() {
  const { staff, openModal } = useCareFlow();
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return staff.slice(start, start + ITEMS_PER_PAGE);
  }, [staff, currentPage]);

  return (
    <div className="space-y-6">
      <PageHeader title="Staff" breadcrumbs={[{ name: 'Staff' }]} />
      
      <DataTable
        columns={columns}
        data={paginatedStaff}
        onView={(row) => openModal('view', 'staff', row)}
        onEdit={(row) => openModal('edit', 'staff', row)}
        onDelete={(row) => openModal('delete', 'staff', row)}
      />

      <Pagination
        currentPage={currentPage}
        totalItems={staff.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
