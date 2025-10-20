'use client';

import { useState, useMemo } from 'react';
import { useCareFlow } from '@/contexts/CareFlowContext';
import { PageHeader } from '@/components/app/page-header';
import { DataTable, ColumnDef } from '@/components/app/data-table';
import { Pagination } from '@/components/app/pagination';
import type { EnrichedTransportation } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const getStatusBadgeVariant = (status: EnrichedTransportation['status']) => {
    switch (status) {
      case 'Completed':
        return 'default' as const;
      case 'Canceled':
        return 'destructive' as const;
      case 'In Progress':
      case 'Scheduled':
      default:
        return 'secondary' as const;
    }
  };

const columns: ColumnDef<EnrichedTransportation>[] = [
  {
    accessorKey: 'id',
    header: 'Trip ID',
    cell: (row) => `TRIP-${row.id}`,
  },
  {
    accessorKey: 'client',
    header: 'Client',
    cell: (row) => row.client,
  },
  {
    accessorKey: 'driver',
    header: 'Driver',
    cell: (row) => row.driver,
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: (row) => row.date,
  },
  {
    accessorKey: 'pickup',
    header: 'Pickup',
    cell: (row) => row.pickup,
  },
  {
    accessorKey: 'dropoff',
    header: 'Dropoff',
    cell: (row) => row.dropoff,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ status }) => <Badge variant={getStatusBadgeVariant(status)} className={cn(status === 'Completed' && 'bg-green-500')}>{status}</Badge>,
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: () => null,
  },
];

const ITEMS_PER_PAGE = 8;

export default function TransportationPage() {
  const { transportation, openModal } = useCareFlow();
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return transportation.slice(start, start + ITEMS_PER_PAGE);
  }, [transportation, currentPage]);

  return (
    <div className="space-y-6">
      <PageHeader title="Transportation" breadcrumbs={[{ name: 'Transportation' }]} />
      
      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={paginatedData}
            onView={(row) => openModal('view', 'transportation', row)}
            onEdit={(row) => openModal('edit', 'transportation', row)}
            onDelete={(row) => openModal('delete', 'transportation', row)}
          />

          <Pagination
            currentPage={currentPage}
            totalItems={transportation.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
