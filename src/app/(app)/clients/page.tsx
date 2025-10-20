'use client';

import { useState, useMemo } from 'react';
import { useCareFlow } from '@/contexts/CareFlowContext';
import { PageHeader } from '@/components/app/page-header';
import { DataTable, ColumnDef } from '@/components/app/data-table';
import { Pagination } from '@/components/app/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Printer, Filter, X, CalendarRange } from 'lucide-react';
import type { Client, Schedule } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const getStatusBadgeClass = (status: Client['status']) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-700';
    case 'inactive':
    default:
      return 'bg-red-100 text-red-700';
  }
};

const scheduleColumns: ColumnDef<Schedule>[] = [
  {
    accessorKey: 'staffName',
    header: 'Staff',
    cell: (row) => row.staffName,
  },
  {
    accessorKey: 'serviceType',
    header: 'Service',
    cell: (row) => row.serviceType,
  },
  {
    accessorKey: 'startDate',
    header: 'Period',
    cell: (row) => <div className="text-xs min-w-[80px]">{row.startDate}<br />to {row.endDate}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (row) => <span className={`badge ${row.status === 'active' ? 'badge-success' : row.status === 'expired' ? 'badge-danger' : 'badge-warning'}`}>{row.status}</span>,
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: () => null,
  },
];


const ITEMS_PER_PAGE = 5;

export default function ClientsPage() {
  const { clients, schedules, openModal } = useCareFlow();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(clients[0] || null);


  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchesSearch = searchTerm === '' ||
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [clients, searchTerm, statusFilter]);

  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredClients.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredClients, currentPage]);

  const clientSchedules = useMemo(() => {
    if (!selectedClient) return [];
    return schedules.filter(s => s.clientId === selectedClient.id);
  }, [schedules, selectedClient]);


  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCurrentPage(1);
  };
  
  const getClientAvatar = (clientId: number) => {
    // This is a placeholder. In a real app, you might have client images.
    const avatar = PlaceHolderImages.find(img => img.id === `staff-${clientId}`);
    return avatar?.imageUrl || '';
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Clients" breadcrumbs={[{ name: 'Clients' }]}>
        <Button variant="outline" size="sm" onClick={() => openModal('add', 'clients')}>
          + Add New Client
        </Button>
      </PageHeader>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>All Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Input 
                  placeholder="Search clients..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="mb-4"
                />
                 <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full mb-4">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>

                {paginatedClients.map(c => (
                  <div 
                    key={c.id} 
                    onClick={() => setSelectedClient(c)}
                    className={cn(
                        "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                        selectedClient?.id === c.id ? "bg-primary/10" : "hover:bg-muted"
                    )}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={getClientAvatar(c.id)} alt={`${c.firstName} ${c.lastName}`} />
                      <AvatarFallback>{c.firstName[0]}{c.lastName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{c.firstName} {c.lastName}</div>
                      <div className="text-xs text-muted-foreground">{c.email}</div>
                    </div>
                     <span className={`ml-auto text-xs font-semibold px-2 py-1 rounded-full ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{c.status}</span>
                  </div>
                ))}
              </div>

               {filteredClients.length > ITEMS_PER_PAGE && (
                 <Pagination
                    currentPage={currentPage}
                    totalItems={filteredClients.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                />
               )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {selectedClient ? (
            <>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CalendarRange className="w-5 h-5 text-primary" />
                    Schedules for {selectedClient.firstName} {selectedClient.lastName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={scheduleColumns}
                    data={clientSchedules}
                    onView={(row) => openModal('view', 'schedules', row)}
                    onEdit={(row) => openModal('edit', 'schedules', row)}
                    onDelete={(row) => openModal('delete', 'schedules', row)}
                  />
                </CardContent>
              </Card>
              {/* You can add more cards here for other client details */}
            </>
          ) : (
             <div className="flex items-center justify-center h-full bg-card rounded-2xl border border-dashed">
                <p className="text-muted-foreground">Select a client to see their details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
