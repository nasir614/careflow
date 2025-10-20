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
import ViewClientModal from '@/components/app/modals/view-client-modal';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export default function ClientsPage() {
  const { clients, openModal } = useCareFlow();
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

  // Update selected client if it's filtered out
  if(selectedClient && !filteredClients.find(c => c.id === selectedClient.id)) {
      setSelectedClient(filteredClients[0] || null);
  } else if (!selectedClient && filteredClients.length > 0) {
      setSelectedClient(filteredClients[0] || null);
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Clients" breadcrumbs={[{ name: 'Clients' }]}>
        <Button variant="outline" size="sm" onClick={() => openModal('add', 'clients')}>
          + Add New Client
        </Button>
      </PageHeader>
      
       <Card>
        <CardHeader>
          <CardTitle>Client Directory</CardTitle>
          <div className="flex flex-col md:flex-row gap-2 pt-4">
              <Input 
                placeholder="Search clients..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full md:w-1/3"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
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
        <CardContent>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex space-x-4 pb-4">
              {filteredClients.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => setSelectedClient(c)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors w-36 shrink-0 border-2",
                    selectedClient?.id === c.id ? "border-primary bg-primary/10" : "border-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <Avatar className="h-12 w-12 bg-gradient-to-br from-primary to-pink-400 text-white font-bold">
                    <AvatarFallback>{c.firstName[0]}{c.lastName[0]}</AvatarFallback>
                  </Avatar>
                  <div className='text-center'>
                    <Badge variant="secondary" className="mb-1">ID: {c.id}</Badge>
                    <div className="font-medium text-sm truncate w-full">{c.firstName} {c.lastName}</div>
                    <div className="text-xs text-muted-foreground truncate w-full">{c.email}</div>
                  </div>
                </div>
              ))}
              {filteredClients.length === 0 && (
                  <div className="w-full text-center py-8 text-muted-foreground">No clients found.</div>
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>
      
      <div>
        {selectedClient ? (
            <ViewClientModal client={selectedClient} />
        ) : (
            <div className="flex items-center justify-center h-64 bg-card rounded-2xl border border-dashed">
                <p className="text-muted-foreground">Select a client to see their details.</p>
            </div>
        )}
      </div>
    </div>
  );
}
