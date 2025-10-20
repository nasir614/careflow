import { Schedule } from '@/lib/types';
import { useCareFlow } from '@/contexts/CareFlowContext';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, UserCog, Clock, ClipboardCheck, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewScheduleModalProps {
  schedule: Schedule;
}

const StatBlock: React.FC<{ title: string; value: React.ReactNode; color: string }> = ({ title, value, color }) => (
    <div className={cn("bg-muted/70 rounded-lg p-4 text-center border-t-4", color)}>
        <div className="text-2xl font-bold font-headline">{value}</div>
        <div className="text-xs text-muted-foreground">{title}</div>
    </div>
);

const InfoBlock: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode; }> = ({ title, icon: Icon, children }) => (
    <div className="bg-muted/50 rounded-lg p-4 h-full">
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Icon className="w-4 h-4 text-primary" />
            {title}
        </h4>
        <div className="space-y-3">{children}</div>
    </div>
);

const InfoItem: React.FC<{ label: string; value: React.ReactNode; }> = ({ label, value }) => (
    <div>
        <p className="text-xs text-muted-foreground uppercase">{label}</p>
        <p className="text-sm font-medium">{value}</p>
    </div>
);

export default function ViewScheduleModal({ schedule }: ViewScheduleModalProps) {
  const { openModal, clients } = useCareFlow();
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const unitUsage = schedule.totalUnits > 0 ? (schedule.usedUnits / schedule.totalUnits) * 100 : 0;
  
  const endDate = new Date(schedule.endDate);
  const today = new Date();
  // Set time to 0 to compare dates only
  endDate.setHours(0,0,0,0);
  today.setHours(0,0,0,0);

  const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  const getStatusBadgeClass = (status: Schedule['status']) => {
    switch (status) {
      case 'active':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'expired':
      default:
        return 'badge-danger';
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-start gap-4 pb-6 border-b">
         <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/80 to-accent flex items-center justify-center text-primary-foreground">
            <Calendar className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold font-headline text-foreground">
            {schedule.serviceType}
          </h3>
          <div className="flex items-center gap-4 mt-1">
             <span className={cn('badge', getStatusBadgeClass(schedule.status))}>
              {schedule.status}
            </span>
            <span className="text-sm text-muted-foreground">Service Code: {schedule.serviceCode}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-4">
        <StatBlock title="Units Remaining" value={schedule.totalUnits - schedule.usedUnits} color="border-primary" />
        <StatBlock title="Hours Per Day" value={`${schedule.hoursPerDay}h`} color="border-accent-foreground" />
        <StatBlock title="Days Remaining" value={daysRemaining >= 0 ? daysRemaining : 0} color={daysRemaining < 0 ? 'border-destructive' : (daysRemaining < 30 ? 'border-yellow-500' : 'border-green-500')} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-foreground">Unit Usage</span>
          <span className="text-sm text-muted-foreground">{schedule.usedUnits} / {schedule.totalUnits} units used ({unitUsage.toFixed(0)}%)</span>
        </div>
        <Progress value={unitUsage} className="h-3" />
      </div>

      <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Weekly Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="grid grid-cols-7 gap-2">
                {daysOfWeek.map(day => {
                    const isScheduled = Array.isArray(schedule.days) && schedule.days.map(d => d.toLowerCase()).includes(day.toLowerCase());
                    return (
                        <div key={day} className={cn('p-3 rounded-lg text-center border-2', isScheduled ? 'bg-primary/10 border-primary/40 text-primary' : 'bg-muted/50 border-transparent text-muted-foreground')}>
                            <div className="text-xs font-semibold mb-1">{day.slice(0, 3).toUpperCase()}</div>
                            {isScheduled && <Clock className="w-4 h-4 mx-auto" />}
                        </div>
                    );
                })}
            </div>
          </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoBlock title="Client & Service" icon={Users}>
          <InfoItem label="Client Name" value={schedule.clientName} />
          <InfoItem label="Service Type" value={schedule.serviceType} />
          <InfoItem label="Service Period" value={`${schedule.startDate} to ${schedule.endDate}`} />
        </InfoBlock>
        <InfoBlock title="Staff & Frequency" icon={UserCog}>
          <InfoItem label="Staff Name" value={schedule.staffName} />
          <InfoItem label="Frequency" value={schedule.frequency} />
          <InfoItem label="Hours Per Day" value={`${schedule.hoursPerDay} hours`} />
        </InfoBlock>
      </div>

       <Card>
        <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
                <button onClick={() => openModal('view', 'attendance', null)} className="bg-muted p-4 rounded-lg hover:bg-muted/80">
                    <ClipboardCheck className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                    <p className="text-sm font-medium">View Attendance</p>
                </button>
                <button onClick={() => openModal('view', 'billing', null)} className="bg-muted p-4 rounded-lg hover:bg-muted/80">
                    <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-500" />
                    <p className="text-sm font-medium">View Billing</p>
                </button>
                <button onClick={() => {
                    const client = clients.find(c => c.id === schedule.clientId);
                    if(client) openModal('view', 'clients', client);
                }} className="bg-muted p-4 rounded-lg hover:bg-muted/80">
                    <Users className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                    <p className="text-sm font-medium">Client Profile</p>
                </button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
