'use client';

import { useState, useMemo } from 'react';
import { useCareFlow } from '@/contexts/CareFlowContext';
import { PageHeader } from '@/components/app/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Client } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination } from '@/components/app/pagination';
import ViewClientModal from '@/components/app/modals/view-client-modal';

const ITEMS_PER_PAGE = 10;

export default function ClientsPage() {
  const { clients, openModal } = useCareFlow();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(clients[0] || null);


  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchesSearch = searchTerm === '' ||
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [clients, searchTerm, statusFilter]);

  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredClients.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredClients, currentPage]);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <PageHeader title="Clients" breadcrumbs={[{ name: 'Clients' }]}>
        <Button variant="outline" size="sm" onClick={() => openModal('add', 'clients')}>
          + Add New Client
        </Button>
      </PageHeader>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <div className="lg:col-span-1 flex flex-col">
          <Card className="hover:shadow-lg transition-shadow flex-1 flex flex-col">
            <CardHeader>
                <div className="space-y-2">
                    <Input 
                    placeholder="Search clients..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full">
                        <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-2">
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
                      <AvatarFallback>{c.firstName[0]}{c.lastName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{c.firstName} {c.lastName}</div>
                      <div className="text-xs text-muted-foreground truncate">{c.email}</div>
                    </div>
                     <span className={`ml-auto text-xs font-semibold px-2 py-1 rounded-full ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{c.status}</span>
                  </div>
                ))}
                 {paginatedClients.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">No clients found.</div>
                )}
            </CardContent>
             {filteredClients.length > ITEMS_PER_PAGE && (
                <div className="p-4 border-t">
                 <Pagination
                    currentPage={currentPage}
                    totalItems={filteredClients.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                />
               </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-2 overflow-y-auto pr-2">
          {selectedClient ? (
            <ViewClientModal client={selectedClient} />
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
