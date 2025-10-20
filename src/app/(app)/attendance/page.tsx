'use client';

import { useState, useMemo } from 'react';
import { useCareFlow } from '@/contexts/CareFlowContext';
import { PageHeader } from '@/components/app/page-header';
import { DataTable, ColumnDef } from '@/components/app/data-table';
import { Pagination } from '@/components/app/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, X } from 'lucide-react';
import type { Attendance } from '@/lib/types';

const columns: ColumnDef<Attendance>[] = [
  {
    accessorKey: 'clientName',
    header: 'Client',
    cell: (row) => row.clientName,
  },
  {
    accessorKey: 'staffName',
    header: 'Staff',
    cell: (row) => row.staffName,
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: (row) => row.date,
  },
  {
    accessorKey: 'checkInAM',
    header: 'Time In',
    cell: (row) => (
      <div>
        {row.checkInAM && <div>AM: {row.checkInAM}</div>}
        {row.checkInPM && <div>PM: {row.checkInPM}</div>}
      </div>
    ),
  },
  {
    accessorKey: 'checkOutAM',
    header: 'Time Out',
    cell: (row) => (
       <div>
        {row.checkOutAM && <div>AM: {row.checkOutAM}</div>}
        {row.checkOutPM && <div>PM: {row.checkOutPM}</div>}
      </div>
    ),
  },
  {
    accessorKey: 'totalHours',
    header: 'Total Hours',
    cell: (row) => row.totalHours.toFixed(2),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (row) => <span className={`badge ${row.status === 'present' ? 'badge-success' : row.status === 'excused' ? 'badge-warning' : 'badge-danger'}`}>{row.status}</span>,
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: () => null,
  },
];

const ITEMS_PER_PAGE = 8;

export default function AttendancePage() {
  const { attendance, clients, staff, openModal } = useCareFlow();
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('all');
  const [staffFilter, setStaffFilter] = useState('all');

  const clientOptions = useMemo(() => [...new Set(clients.map(c => `${c.firstName} ${c.lastName}`))], [clients]);
  const staffOptions = useMemo(() => [...new Set(staff.map(s => s.name))], [staff]);

  const filteredData = useMemo(() => {
    return attendance.filter(item => {
      const matchesDate = !dateFilter || item.date === dateFilter;
      const matchesClient = clientFilter === 'all' || item.clientName === clientFilter;
      const matchesStaff = staffFilter === 'all' || item.staffName === staffFilter;
      return matchesDate && matchesClient && matchesStaff;
    });
  }, [attendance, dateFilter, clientFilter, staffFilter]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const clearFilters = () => {
    setDateFilter('');
    setClientFilter('all');
    setStaffFilter('all');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" breadcrumbs={[{ name: 'Attendance' }]} />

      <div className="bg-card rounded-lg border p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <Input 
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="max-w-xs"
          />
          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {clientOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={staffFilter} onValueChange={setStaffFilter}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="All Staff" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff</SelectItem>
              {staffOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="ghost" onClick={clearFilters} className="text-sm">
            <X className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </div>
      
      <DataTable
        columns={columns}
        data={paginatedData}
        onView={(row) => openModal('view', 'attendance', row)}
        onEdit={(row) => openModal('edit', 'attendance', row)}
        onDelete={(row) => openModal('delete', 'attendance', row)}
      />

      <Pagination
        currentPage={currentPage}
        totalItems={filteredData.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
