'use client';

import { useState, useMemo } from 'react';
import { useCareFlow } from '@/contexts/CareFlowContext';
import { PageHeader } from '@/components/app/page-header';
import { DataTable, ColumnDef } from '@/components/app/data-table';
import { Pagination } from '@/components/app/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Printer, Filter, X } from 'lucide-react';
import type { Client } from '@/lib/types';

const columns: ColumnDef<Client>[] = [
  {
    accessorKey: 'firstName',
    header: 'Name',
    cell: (row) => `${row.firstName} ${row.lastName}`,
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: (row) => row.phone,
  },
  {
    accessorKey: 'city',
    header: 'Location',
    cell: (row) => `${row.city}, ${row.state}`,
  },
  {
    accessorKey: 'providerName',
    header: 'Provider',
    cell: (row) => row.providerName,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (row) => <span className={`badge ${row.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{row.status}</span>,
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: () => null, // Rendered by DataTable
  },
];

const ITEMS_PER_PAGE = 8;

export default function ClientsPage() {
  const { clients, openModal } = useCareFlow();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');

  const providerOptions = useMemo(() => [...new Set(clients.map(c => c.providerName))], [clients]);

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchesSearch = searchTerm === '' ||
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchesProvider = providerFilter === 'all' || c.providerName === providerFilter;
      return matchesSearch && matchesStatus && matchesProvider;
    });
  }, [clients, searchTerm, statusFilter, providerFilter]);

  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredClients.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredClients, currentPage]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setProviderFilter('all');
    setCurrentPage(1);
  };
  
  const exportToCSV = () => {
    const headers = Object.keys(clients[0] || {});
    const csv = [
      headers.join(','),
      ...clients.map(row => headers.map(h => JSON.stringify(row[h as keyof Client])).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clients_export_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  
  const printTable = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Clients" breadcrumbs={[{ name: 'Clients' }]}>
        <Button variant="outline" size="sm" onClick={exportToCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
        <Button variant="outline" size="sm" onClick={printTable}>
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
      </PageHeader>
      
      <div className="bg-card rounded-lg border p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <Input 
            placeholder="Search by name, phone, email..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={providerFilter} onValueChange={setProviderFilter}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="All Providers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers</SelectItem>
              {providerOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
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
        data={paginatedClients}
        onView={(row) => openModal('view', 'clients', row)}
        onEdit={(row) => openModal('edit', 'clients', row)}
        onDelete={(row) => openModal('delete', 'clients', row)}
      />

      <Pagination
        currentPage={currentPage}
        totalItems={filteredClients.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
