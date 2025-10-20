'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';
import type { DataModule, AnyData, PlanStatus, Attendance } from '@/lib/types';
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
    type: 'text' | 'tel' | 'email' | 'date' | 'time' | 'number' | 'select' | 'textarea' | 'checkbox';
    required?: boolean;
    options?: { value: string | number; label: string }[] | string[];
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

const getFieldsForModule = (module: DataModule, clients: any[], staff: any[], servicePlans: any[]): FieldConfig[] => {
    const clientOptions = clients.map(c => ({ value: c.id, label: `${c.firstName} ${c.lastName}` }));
    const staffOptions = staff.map(s => ({ value: s.id, label: s.name }));
    const roleOptions = [...new Set(staff.map(s => s.role))];
    const serviceTypeOptions = ['Adult Day Care', 'Personal Care', 'Day Support', 'Respite Care'];
    const servicePlanOptions = servicePlans.map(p => ({ value: p.id, label: `${p.planName} (${p.clientName})` }));

    const planStatusOptions: PlanStatus[] = ['Active', 'Pending', 'Expired', 'Inactive'];

    switch (module) {
        case 'servicePlans':
            return [
                { name: 'clientId', label: 'Client', type: 'select', options: clientOptions, required: true },
                { name: 'planName', label: 'Plan Name', type: 'text', required: true },
                { name: 'type', label: 'Service Type', type: 'select', options: ['Medical', 'Personal Care', 'Social'], required: true },
                { name: 'billingCode', label: 'Billing Code', type: 'text', required: true },
                { name: 'startDate', label: 'Start Date', type: 'date', required: true },
                { name: 'endDate', label: 'End Date', type: 'date', required: true },
                { name: 'status', label: 'Status', type: 'select', options: planStatusOptions, required: true, placeholder: 'Status' },
                { name: 'notes', label: 'Notes', type: 'textarea', className: 'md:col-span-2' },
            ];
        case 'carePlans':
            return [
                { name: 'clientId', label: 'Client', type: 'select', options: clientOptions, required: true },
                { name: 'planName', label: 'Care Plan Title', type: 'text', required: true },
                { name: 'assignedStaffId', label: 'Assigned Staff', type: 'select', options: staffOptions, required: true },
                { name: 'startDate', label: 'Start Date', type: 'date', required: true },
                { name: 'endDate', label: 'End Date', type: 'date', required: true },
                { name: 'status', label: 'Status', type: 'select', options: planStatusOptions, required: true, placeholder: 'Status' },
                { name: 'goals', label: 'Care Goals', type: 'textarea', className: 'md:col-span-2' },
                { name: 'notes', label: 'Notes', type: 'textarea', className: 'md:col-span-2' },
            ];
        case 'authorizations':
            return [
                { name: 'clientId', label: 'Client', type: 'select', options: clientOptions, required: true },
                { name: 'servicePlanId', label: 'Service Plan', type: 'select', options: servicePlanOptions, required: true },
                { name: 'authorizedHours', label: 'Authorized Hours', type: 'number', required: true },
                { name: 'startDate', label: 'Start Date', type: 'date', required: true },
                { name: 'endDate', label: 'End Date', type: 'date', required: true },
                { name: 'status', label: 'Status', type: 'select', options: planStatusOptions, required: true, placeholder: 'Status' },
                { name: 'notes', label: 'Notes', type: 'textarea', className: 'md:col-span-2' },
            ];
        case 'staffCredentials':
            return [
                { name: 'staffId', label: 'Staff Member', type: 'select', options: staffOptions, required: true },
                { name: 'credential', label: 'Credential', type: 'text', required: true },
                { name: 'training', label: 'Training', type: 'text' },
                { name: 'hrDocument', label: 'HR Document', type: 'text' },
                { name: 'startDate', label: 'Start Date', type: 'date', required: true },
                { name: 'expirationDate', label: 'Expiration Date', type: 'date', required: true },
                { name: 'renewalDate', label: 'Renewal Date', type: 'date' },
                { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Expired', 'Expiring Soon'], required: true },
                { name: 'actionTaken', label: 'Action Taken', type: 'text' },
                { name: 'isCritical', label: 'Critical Requirement', type: 'checkbox' },
            ];
        case 'staff':
            return [
                { name: 'name', label: 'Full Name', type: 'text', required: true },
                { name: 'role', label: 'Role', type: 'text', required: true },
                { name: 'phone', label: 'Phone', type: 'tel', required: true },
                { name: 'email', label: 'Email', type: 'email', required: true },
                { name: 'department', label: 'Department', type: 'select', options: ['Medical', 'Care', 'Administration'], required: true },
                { name: 'schedule', label: 'Schedule', type: 'text', required: true },
                { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'], required: true },
                { name: 'emergencyContactName', label: 'Emergency Contact Name', type: 'text'},
                { name: 'emergencyContactPhone', label: 'Emergency Contact Phone', type: 'tel'}
            ];
        case 'compliance':
            return [
                { name: 'clientId', label: 'Client', type: 'select', options: clientOptions, required: true },
                { name: 'type', label: 'Type', type: 'select', options: ['Authorization', 'Document', 'Certification'], required: true },
                { name: 'item', label: 'Item', type: 'text', required: true },
                { name: 'dueDate', label: 'Due Date', type: 'date', required: true },
                { name: 'status', label: 'Status', type: 'select', options: ['Current', 'Expiring Soon', 'Expired'], required: true }
            ];
        case 'billing':
            return [
                { name: 'clientId', label: 'Client', type: 'select', options: clientOptions, required: true, className: 'md:col-span-2' },
                { name: 'serviceDate', label: 'Service Date', type: 'date', required: true },
                { name: 'serviceType', label: 'Service Type', type: 'text', required: true },
                { name: 'serviceCode', label: 'Service Code', type: 'text', required: true },
                { name: 'units', label: 'Units (hours)', type: 'number', required: true },
                { name: 'rate', label: 'Rate ($)', type: 'number', required: true },
                { name: 'status', label: 'Status', type: 'select', options: ['Pending', 'Submitted', 'Paid', 'Denied'], required: true }
            ];
        case 'transportation':
            return [
                { name: 'clientId', label: 'Client', type: 'select', options: clientOptions, required: true },
                { name: 'driverId', label: 'Driver', type: 'select', options: staffOptions.filter(s => s.label.includes('Driver')), required: true },
                { name: 'date', label: 'Date', type: 'date', required: true },
                { name: 'pickup', label: 'Pickup Time', type: 'time', required: true },
                { name: 'dropoff', label: 'Dropoff Time', type: 'time', required: true },
                { name: 'route', label: 'Route', type: 'text', required: true },
                { name: 'status', label: 'Status', type: 'select', options: ['Scheduled', 'In Progress', 'Completed', 'Canceled'], required: true }
            ];
        case 'attendance':
             return [
                { name: 'clientId', label: 'Client', type: 'select', options: clientOptions, required: true },
                { name: 'staffId', label: 'Staff Member', type: 'select', options: staffOptions, required: true },
                { name: 'date', label: 'Date', type: 'date', required: true },
                { name: 'status', label: 'Status', type: 'select', options: ['present', 'absent', 'excused'], required: true },
                { name: 'checkInAM', label: 'Check-in (AM)', type: 'time' },
                { name: 'checkOutAM', label: 'Check-out (AM)', type: 'time' },
                { name: 'checkInPM', label: 'Check-in (PM)', type: 'time' },
                { name: 'checkOutPM', label: 'Check-out (PM)', type: 'time' },
                { name: 'billingCode', label: 'Billing Code', type: 'text' },
                { name: 'procedures', label: 'Procedures', type: 'textarea', className: 'md:col-span-2' },
                { name: 'isBillable', label: 'Billable', type: 'checkbox' },
                { name: 'adminStatus', label: 'Admin Status', type: 'select', options: ['Pending', 'Approved', 'Rejected'] },
                { name: 'notes', label: 'Notes/Reason for Absence', type: 'textarea', className: 'md:col-span-2' },
            ];
        default:
            return [];
    }
}

export default function GenericForm({ module, item, onSubmit, isLoading, onCancel }: GenericFormProps) {
  const { clients, staff, servicePlans } = useCareFlow();
  const [formData, setFormData] = useState<Partial<AnyData>>({});
  const fields = getFieldsForModule(module, clients, staff, servicePlans);

  useEffect(() => {
    if (item) {
      const initialData: Partial<AnyData> = { ...item };
       // Ensure IDs are strings for select components
      const idFields: (keyof AnyData)[] = ['clientId', 'staffId', 'assignedStaffId', 'servicePlanId', 'driverId'];
      idFields.forEach(field => {
        if (field in initialData && initialData[field]) {
          (initialData as any)[field] = String(initialData[field]);
        }
      });
      setFormData(initialData);
    } else {
      const defaults: Partial<AnyData> = {};
      if (module === 'staffCredentials') {
          defaults.isCritical = false;
      }
       if (module === 'attendance') {
        defaults.status = 'present';
        defaults.date = new Date().toISOString().split('T')[0];
        defaults.isBillable = true;
        defaults.adminStatus = 'Pending';
      }
      setFormData(defaults);
    }
  }, [item, module]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isNumber = (e.target as HTMLInputElement).type === 'number' && value !== '';
    setFormData(prev => ({ ...prev, [name]: isNumber ? parseFloat(value) : value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSubmit = { ...formData };
    
    const idFields: (keyof AnyData)[] = ['clientId', 'staffId', 'assignedStaffId', 'servicePlanId', 'driverId'];
    idFields.forEach(field => {
      if (dataToSubmit[field] && typeof dataToSubmit[field] === 'string') {
        (dataToSubmit as any)[field] = parseInt(dataToSubmit[field] as string, 10);
      }
    });

    onSubmit(dataToSubmit);
  };
  
  const renderField = (field: FieldConfig) => {
    const { name, label, type, required, options, placeholder, className, disabled } = field;
    const commonProps = {
        className: className || ''
    };

    if (type === 'select') {
      return (
        <div key={name} {...commonProps}>
          <label className="block text-sm font-medium text-muted-foreground mb-1">{label}{required && <span className="text-destructive">*</span>}</label>
          <Select value={(formData[name as keyof AnyData] as string) || ""} onValueChange={(value) => handleSelectChange(name, value)} required={required} disabled={disabled}>
            <SelectTrigger>
              <SelectValue placeholder={placeholder || `Select ${label}`} />
            </SelectTrigger>
            <SelectContent>
              {options?.map(opt => 
                typeof opt === 'string' 
                ? <SelectItem key={opt} value={opt}>{opt}</SelectItem> 
                : <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      );
    }
    if (type === 'textarea') {
      return (
         <div key={name} {...commonProps}>
          <label className="block text-sm font-medium text-muted-foreground mb-1">{label}{required && <span className="text-destructive">*</span>}</label>
          <Textarea name={name} value={(formData[name as keyof AnyData] as string) || ''} onChange={handleChange} required={required} placeholder={placeholder} />
        </div>
      );
    }
    if (type === 'checkbox') {
        return (
          <div key={name} className={`flex items-center gap-2 pt-6 ${className || ''}`}>
            <Checkbox
              id={name}
              name={name}
              checked={formData[name as keyof AnyData] as boolean | undefined}
              onCheckedChange={(checked) => handleCheckboxChange(name, !!checked)}
            />
            <Label htmlFor={name} className="font-medium text-muted-foreground">{label}</Label>
          </div>
        );
      }
    return (
      <div key={name} {...commonProps}>
        <label className="block text-sm font-medium text-muted-foreground mb-1">{label}{required && <span className="text-destructive">*</span>}</label>
        <Input type={type} name={name} value={(formData[name as keyof AnyData] as any) || ''} onChange={handleChange} required={required} placeholder={placeholder} />
      </div>
    );
  };
  
  const getSingularModuleName = (module: string) => {
    if (module === 'staffCredentials') return 'Staff Credential';
    if (module.endsWith('ies')) return module.slice(0, -3) + 'y';
    if (module.endsWith('s')) return module.slice(0, -1);
    return module;
  }
  
  const getModalTitle = () => {
    const titleAction = item ? 'Edit' : 'Create';
    const singular = getSingularModuleName(module);
    return `${titleAction} ${singular.charAt(0).toUpperCase() + singular.slice(1)}`;
  }


  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 p-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(field => renderField(field))}
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {item ? 'Save Changes' : `Create ${getSingularModuleName(module)}`}
        </Button>
      </div>
    </form>
  );
}
