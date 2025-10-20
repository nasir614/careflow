import { Client, Attendance, Billing, Compliance } from '@/lib/types';
import { useCareFlow } from '@/contexts/CareFlowContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Phone, Mail, MapPin, FileText, UserCog, ClipboardCheck, DollarSign, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ViewClientModalProps {
  client: Client;
}

const InfoBlock: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode; color: string; }> = ({ title, icon: Icon, children, color }) => (
    <div className={`bg-gradient-to-br ${color} rounded-lg p-4 border border-border/60 h-full`}>
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Icon className="w-4 h-4 text-primary" />
            {title}
        </h4>
        <div className="space-y-3">{children}</div>
    </div>
);

const InfoItem: React.FC<{ label: string; value: React.ReactNode; icon?: React.ElementType; }> = ({ label, value, icon: Icon }) => (
    <div>
        <p className="text-xs text-muted-foreground uppercase">{label}</p>
        <div className="text-sm font-medium flex items-center gap-2 mt-0.5">
            {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground" />}
            <span>{value}</span>
        </div>
    </div>
);

export default function ViewClientModal({ client }: ViewClientModalProps) {
  const { attendance, billing, compliance } = useCareFlow();
  
  const relatedAttendance = attendance.filter(a => a.clientName === `${client.firstName} ${client.lastName}`);
  const relatedBilling = billing.filter(b => b.client === `${client.firstName} ${client.lastName}`);
  const relatedCompliance = compliance.filter(c => c.client === `${client.firstName} ${client.lastName}`);

  return (
    <div className="space-y-6">
      <header className="flex items-start gap-4 pb-6 border-b">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-headline text-4xl">
          {client.firstName[0]}{client.lastName[0]}
        </div>
        <div className="flex-1">
          <h3 className="text-3xl font-bold font-headline text-foreground">
            {client.firstName} {client.lastName}
          </h3>
          <div className="flex items-center gap-4 mt-1">
            <span className={`badge ${client.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
              {client.status}
            </span>
            <span className="text-sm text-muted-foreground">Client ID: {client.id}</span>
            <span className="text-sm text-muted-foreground">Member Since: {client.createdAt}</span>
          </div>
        </div>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InfoBlock title="Personal Information" icon={Users} color="from-blue-500/10 to-card">
          <InfoItem label="Full Name" value={`${client.firstName} ${client.lastName}`} />
          <InfoItem label="Phone" value={client.phone} icon={Phone} />
          <InfoItem label="Email" value={client.email} icon={Mail} />
        </InfoBlock>
        <InfoBlock title="Address" icon={MapPin} color="from-green-500/10 to-card">
          <InfoItem label="Street" value={client.address} />
          <InfoItem label="City" value={client.city} />
          <div className="grid grid-cols-2 gap-4">
             <InfoItem label="State" value={client.state} />
             <InfoItem label="ZIP Code" value={client.zip} />
          </div>
        </InfoBlock>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InfoBlock title="Provider Information" icon={FileText} color="from-purple-500/10 to-card">
          <InfoItem label="Agency Name" value={client.providerName} />
          <InfoItem label="Insurance/HMO" value={client.insurance} />
          <InfoItem label="Service Code" value={client.serviceCode} />
        </InfoBlock>
        <InfoBlock title="Case Manager" icon={UserCog} color="from-orange-500/10 to-card">
          <InfoItem label="Name" value={client.caseManager} />
          <InfoItem label="Phone" value={client.caseManagerPhone} icon={Phone}/>
          <InfoItem label="Email" value={client.caseManagerEmail} icon={Mail}/>
        </InfoBlock>
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="text-base">Related Records</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-muted p-4 rounded-lg">
                    <ClipboardCheck className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                    <p className="text-2xl font-bold">{relatedAttendance.length}</p>
                    <p className="text-xs text-muted-foreground">Attendance Records</p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                    <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-500" />
                    <p className="text-2xl font-bold">{relatedBilling.length}</p>
                    <p className="text-xs text-muted-foreground">Billing Records</p>
                </div>
                 <div className="bg-muted p-4 rounded-lg">
                    <FileCheck className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                    <p className="text-2xl font-bold">{relatedCompliance.length}</p>
                    <p className="text-xs text-muted-foreground">Compliance Items</p>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
