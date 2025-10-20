'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save } from 'lucide-react';
import type { DataModule, AnyData } from '@/lib/types';
import { useCareFlow } from '@/contexts/CareFlowContext';

interface GenericFormProps {
  module: DataModule;
  item: AnyData | null;
  onSubmit: (data: Partial<AnyData>) => void;
  isLoading: boolean;
  onCancel: () => void;
}

type FieldConfig = {
    name: string;
    label: string;
    type: 'text' | 'tel' | 'email' | 'date' | 'time' | 'number' | 'select' | 'textarea';
    required?: boolean;
    options?: string[];
    placeholder?: string;
}

const getFieldsForModule = (module: DataModule, clients: any[], staff: any[]): FieldConfig[] => {
    switch (module) {
        case 'staff':
            return [
                { name: 'name', label: 'Full Name', type: 'text', required: true },
                { name: 'role', label: 'Role', type: 'text', required: true },
                { name: 'phone', label: 'Phone', type: 'tel', required: true },
                { name: 'email', label: 'Email', type: 'email', required: true },
                { name: 'department', label: 'Department', type: 'select', options: ['Medical', 'Care', 'Administration'], required: true },
                { name: 'schedule', label: 'Schedule', type: 'text', required: true },
                { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'], required: true }
            ];
        case 'attendance':
             return [
                { name: 'clientName', label: 'Client Name', type: 'text', required: true },
                { name: 'date', label: 'Date', type: 'date', required: true },
                { name: 'checkIn', label: 'Check In', type: 'time', required: true },
                { name: 'checkOut', label: 'Check Out', type: 'time', required: false },
                { name: 'status', label: 'Status', type: 'select', options: ['Present', 'Absent', 'Late Arrival', 'Early Departure'], required: true },
                { name: 'notes', label: 'Notes', type: 'textarea', required: false }
            ];
        case 'compliance':
            return [
                { name: 'client', label: 'Client', type: 'text', required: true },
                { name: 'type', label: 'Type', type: 'select', options: ['Authorization', 'Document', 'Certification'], required: true },
                { name: 'item', label: 'Item', type: 'text', required: true },
                { name: 'dueDate', label: 'Due Date', type: 'date', required: true },
                { name: 'status', label: 'Status', type: 'select', options: ['Current', 'Expiring Soon', 'Expired'], required: true }
            ];
        case 'billing':
            return [
                { name: 'client', label: 'Client', type: 'text', required: true },
                { name: 'serviceDate', label: 'Service Date', type: 'date', required: true },
                { name: 'units', label: 'Units (hours)', type: 'number', required: true },
                { name: 'rate', label: 'Rate ($)', type: 'number', required: true },
                { name: 'status', label: 'Status', type: 'select', options: ['Pending', 'Approved', 'Paid', 'Denied'], required: true }
            ];
        case 'transportation':
            return [
                { name: 'client', label: 'Client', type: 'text', required: true },
                { name: 'driver', label: 'Driver', type: 'text', required: true },
                { name: 'date', label: 'Date', type: 'date', required: true },
                { name: 'pickup', label: 'Pickup Time', type: 'time', required: true },
                { name: 'dropoff', label: 'Dropoff Time', type: 'time', required: true },
                { name: 'route', label: 'Route', type: 'text', required: true },
                { name: 'status', label: 'Status', type: 'select', options: ['Scheduled', 'In Progress', 'Completed', 'Canceled'], required: true }
            ];
        default:
            return [];
    }
}

export default function GenericForm({ module, item, onSubmit, isLoading, onCancel }: GenericFormProps) {
  const { clients, staff } = useCareFlow();
  const [formData, setFormData] = useState<Partial<AnyData>>({});
  const fields = getFieldsForModule(module, clients, staff);

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({});
    }
  }, [item]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isNumber = (e.target as HTMLInputElement).type === 'number';
    setFormData(prev => ({ ...prev, [name]: isNumber ? parseFloat(value) : value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  const renderField = (field: FieldConfig) => {
    const { name, label, type, required, options, placeholder } = field;
    if (type === 'select') {
      return (
        <div key={name}>
          <label className="block text-sm font-medium text-muted-foreground mb-1">{label}{required && <span className="text-destructive">*</span>}</label>
          <Select value={formData[name as keyof AnyData] as string || ""} onValueChange={(value) => handleSelectChange(name, value)} required={required}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${label}`} />
            </SelectTrigger>
            <SelectContent>
              {options?.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      );
    }
    if (type === 'textarea') {
      return (
         <div key={name} className="md:col-span-2">
          <label className="block text-sm font-medium text-muted-foreground mb-1">{label}{required && <span className="text-destructive">*</span>}</label>
          <Textarea name={name} value={(formData[name as keyof AnyData] as string) || ''} onChange={handleChange} required={required} placeholder={placeholder} />
        </div>
      );
    }
    return (
      <div key={name}>
        <label className="block text-sm font-medium text-muted-foreground mb-1">{label}{required && <span className="text-destructive">*</span>}</label>
        <Input type={type} name={name} value={(formData[name as keyof AnyData] as any) || ''} onChange={handleChange} required={required} placeholder={placeholder} />
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 p-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(field => renderField(field))}
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {item ? 'Save Changes' : `Create ${module.slice(0, -1)}`}
        </Button>
      </div>
    </form>
  );
}
