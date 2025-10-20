'use client';

import { useState, useMemo } from 'react';
import { useCareFlow } from '@/contexts/CareFlowContext';
import { PageHeader } from '@/components/app/page-header';
import { DataTable, ColumnDef } from '@/components/app/data-table';
import { Pagination } from '@/components/app/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, X, FilePlus2 } from 'lucide-react';
import type { EnrichedBilling } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const columns: ColumnDef<EnrichedBilling>[] = [
  {
    accessorKey: 'invoiceNo',
    header: 'Invoice #',
    cell: ({ invoiceNo }) => invoiceNo,
  },
  {
    accessorKey: 'scheduleId',
    header: 'Schedule ID',
    cell: ({ scheduleId }) => `SCH-${scheduleId}`,
  },
  {
    accessorKey: 'clientName',
    header: 'Client',
    cell: ({ clientName }) => clientName,
  },
  {
    accessorKey: 'serviceDate',
    header: 'Service Date',
    cell: ({ serviceDate }) => serviceDate,
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ amount }) => `$${amount.toFixed(2)}`,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ status }) => <Badge variant={status === 'Paid' ? 'default' : status === 'Denied' ? 'destructive' : 'secondary'} className={cn(status === 'Paid' && 'bg-green-500')}>{status}</Badge>,
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: () => null,
  },
];

const ITEMS_PER_PAGE = 8;

export default function BillingPage() {
  const { billing, clients, openModal, generateInvoicesFromLogs, isLoading } = useCareFlow();
  const [currentPage, setCurrentPage] = useState(1);
  const [clientFilter, setClientFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const clientOptions = useMemo(() => [...new Set(clients.map(c => `${c.firstName} ${c.lastName}`))], [clients]);
  const statusOptions: EnrichedBilling['status'][] = ['Pending', 'Submitted', 'Paid', 'Denied'];

  const filteredData = useMemo(() => {
    return billing.filter(item => {
      const matchesClient = clientFilter === 'all' || item.clientName === clientFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesClient && matchesStatus;
    }).sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime());
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
      ...billing.map(row => headers.map(h => JSON.stringify(row[h as keyof EnrichedBilling])).join(','))
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
        <Button variant="default" size="sm" onClick={generateInvoicesFromLogs} disabled={isLoading}>
          <FilePlus2 className="w-4 h-4 mr-2" />
          {isLoading ? 'Generating...' : 'Generate Invoices'}
        </Button>
      </PageHeader>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4">
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="All Clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {clientOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
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
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
