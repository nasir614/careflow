import { Client, Schedule } from '@/lib/types';
import { useCareFlow } from '@/contexts/CareFlowContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Phone, Mail, MapPin, FileText, UserCog, ClipboardCheck, DollarSign, FileCheck, Calendar, Briefcase } from 'lucide-react';
import { DataTable, ColumnDef } from '@/components/app/data-table';
import { Badge } from '@/components/ui/badge';

interface ViewClientModalProps {
  client: Client;
}

const InfoBlock: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode; color?: string; }> = ({ title, icon: Icon, children, color = "from-card to-card" }) => (
    <Card className={`bg-gradient-to-br ${color}`}>
        <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Icon className="w-5 h-5 text-primary" />
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            {children}
        </CardContent>
    </Card>
);

const InfoItem: React.FC<{ label: string; value: React.ReactNode; icon?: React.ElementType; }> = ({ label, value, icon: Icon }) => (
    <div>
        <p className="text-xs text-muted-foreground uppercase flex items-center gap-1.5">
            {Icon && <Icon className="w-3 h-3" />}
            {label}
        </p>
        <div className="text-sm font-medium mt-0.5">
            {value || <span className="text-muted-foreground italic">N/A</span>}
        </div>
    </div>
);

const scheduleColumns: ColumnDef<Schedule>[] = [
  { accessorKey: 'staffName', header: 'Staff', cell: (row) => row.staffName },
  { accessorKey: 'serviceType', header: 'Service', cell: (row) => row.serviceType },
  { accessorKey: 'days', header: 'Days', cell: (row) => Array.isArray(row.days) ? row.days.join(', ') : row.days },
  { accessorKey: 'hoursPerDay', header: 'Hours', cell: (row) => `${row.hoursPerDay}h/day` },
  { accessorKey: 'status', header: 'Status', cell: (row) => <Badge variant={row.status === 'active' ? 'default' : 'destructive'}>{row.status}</Badge> },
];

export default function ViewClientModal({ client }: ViewClientModalProps) {
  const { schedules } = useCareFlow();
  
  const clientSchedules = schedules.filter(s => s.clientId === client.id);

  return (
    <div className="space-y-4 md:space-y-6">
       <InfoBlock title="Client Information" icon={Users}>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoItem label="Full Name" value={`${client.firstName} ${client.lastName}`} />
            <InfoItem label="Date of Birth" value={client.dob} />
            <InfoItem label="Gender" value={client.gender} />
            <InfoItem label="Phone" value={client.phone} icon={Phone} />
            <InfoItem label="Email" value={client.email} icon={Mail} />
            <InfoItem label="Address" value={`${client.address}, ${client.city}, ${client.state} ${client.zip}`} icon={MapPin} />
            <InfoItem label="Medicaid ID" value={client.medicaidId} />
            <InfoItem label="Primary Insurance" value={client.insurance} />
            <InfoItem label="Secondary Insurance" value={client.insuranceSecondary} />
         </div>
       </InfoBlock>
       
       <InfoBlock title="Case Manager" icon={UserCog}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem label="Name" value={client.caseManager} />
                <InfoItem label="Phone" value={client.caseManagerPhone} icon={Phone} />
                <InfoItem label="Email" value={client.caseManagerEmail} icon={Mail} />
                <InfoItem label="Notes" value={"Oversees PASSPORT services and authorizations."} />
            </div>
       </InfoBlock>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
           <InfoBlock title="Schedules" icon={Calendar}>
              <DataTable columns={scheduleColumns} data={clientSchedules} />
           </InfoBlock>

           <InfoBlock title="Authorizations" icon={FileCheck}>
              <p className="text-sm text-muted-foreground p-4 text-center">Authorization tracking coming soon.</p>
           </InfoBlock>
           
           <InfoBlock title="Providers" icon={Briefcase}>
                <p className="text-sm text-muted-foreground p-4 text-center">Provider tracking coming soon.</p>
           </InfoBlock>
        </div>
    </div>
  );
}
