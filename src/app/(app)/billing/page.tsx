'use client';

import { useState, useMemo } from 'react';
import { useCareFlow } from '@/contexts/CareFlowContext';
import { PageHeader } from '@/components/app/page-header';
import { DataTable, ColumnDef } from '@/components/app/data-table';
import { Pagination } from '@/components/app/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, X } from 'lucide-react';
import type { Billing } from '@/lib/types';
import { cn } from '@/lib/utils';

const getStatusBadgeClass = (status: Billing['status']) => {
  switch (status) {
    case 'Paid':
      return 'bg-green-100 text-green-700';
    case 'Submitted':
      return 'bg-blue-100 text-blue-700';
    case 'Denied':
      return 'bg-red-100 text-red-700';
    case 'Pending':
    default:
      return 'bg-yellow-100 text-yellow-700';
  }
};


const columns: ColumnDef<Billing>[] = [
  {
    accessorKey: 'invoiceNo',
    header: 'Invoice #',
    cell: (row) => row.invoiceNo,
  },
  {
    accessorKey: 'clientName',
    header: 'Client',
    cell: (row) => row.clientName,
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
    cell: (row) => <span className={cn('badge', getStatusBadgeClass(row.status))}>{row.status}</span>,
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: () => null,
  },
];

const ITEMS_PER_PAGE = 8;

export default function BillingPage() {
  const { billing, clients, openModal } = useCareFlow();
  const [currentPage, setCurrentPage] = useState(1);
  const [clientFilter, setClientFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const clientOptions = useMemo(() => [...new Set(clients.map(c => `${c.firstName} ${c.lastName}`))], [clients]);
  const statusOptions: Billing['status'][] = ['Pending', 'Submitted', 'Paid', 'Denied'];

  const filteredData = useMemo(() => {
    return billing.filter(item => {
      const matchesClient = clientFilter === 'all' || item.clientName === clientFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesClient && matchesStatus;
    });
  }, [billing, clientFilter, statusFilter]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);
  
  const clearFilters = () => {
    setClientFilter('all');
    setStatusFilter('all');
  };

  const exportToCSV = () => {
    if (billing.length === 0) return;
    const headers = Object.keys(billing[0]);
    const csv = [
      headers.join(','),
      ...billing.map(row => headers.map(h => JSON.stringify(row[h as keyof Billing])).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billing_export_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Billing" breadcrumbs={[{ name: 'Billing' }]}>
         <Button variant="outline" size="sm" onClick={exportToCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </PageHeader>
      
       <div className="bg-card rounded-2xl border p-4">
        <div className="flex flex-wrap items-center gap-4">
          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="All Clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {clientOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statusOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
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
        onView={(row) => openModal('view', 'billing', row)}
        onEdit={(row) => openModal('edit', 'billing', row)}
        onDelete={(row) => openModal('delete', 'billing', row)}
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
