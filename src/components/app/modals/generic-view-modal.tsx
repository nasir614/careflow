import { AnyData, DataModule } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';

interface GenericViewModalProps {
  item: AnyData;
  module: DataModule;
}

const InfoItem: React.FC<{ label: string; value: React.ReactNode; }> = ({ label, value }) => (
    <div>
        <p className="text-xs text-muted-foreground uppercase">{label.replace(/([A-Z])/g, ' $1').trim()}</p>
        <div className="text-sm font-medium mt-0.5">
            {value}
        </div>
    </div>
);

export default function GenericViewModal({ item, module }: GenericViewModalProps) {
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {Object.entries(item).map(([key, value]) => {
                    if (key === 'id' || key === 'clientId' || key === 'staffId') return null;
                    return (
                        <InfoItem key={key} label={key} value={String(value)} />
                    );
                })}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
