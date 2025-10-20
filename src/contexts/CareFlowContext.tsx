"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";
import { 
  initialClients, 
  initialStaff, 
  initialAttendance, 
  initialCompliance, 
  initialBilling, 
  initialTransportation, 
  initialSchedules, 
  initialStaffCredentials,
  initialServicePlans,
  initialCarePlans,
  initialAuthorizations
} from '@/lib/data';
import type { 
  Client, 
  Staff, 
  Attendance, 
  Compliance, 
  Billing, 
  Transportation, 
  Schedule, 
  DataModule, 
  AnyData, 
  StaffCredential,
  ServicePlan,
  CarePlan,
  Authorization
} from '@/lib/types';

type ModalType = 'add' | 'edit' | 'view' | 'delete' | '';

// Define rates for services
const SERVICE_RATES: { [key: string]: number } = {
    'Adult Day Care': 25, // per hour
    'Personal Care': 30, // per hour
    'Day Support': 28, // per hour
    'Respite Care': 35, // per hour
    'Transportation': 50, // per trip
};

interface CareFlowContextType {
  // State
  clients: Client[];
  staff: Staff[];
  attendance: Attendance[];
  compliance: Compliance[];
  billing: Billing[];
  transportation: Transportation[];
  schedules: Schedule[];
  staffCredentials: StaffCredential[];
  servicePlans: ServicePlan[];
  carePlans: CarePlan[];
  authorizations: Authorization[];
  
  // Handlers
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
  setSchedules: React.Dispatch<React.SetStateAction<Schedule[]>>;
  setAttendance: React.Dispatch<React.SetStateAction<Attendance[]>>;
  setStaffCredentials: React.Dispatch<React.SetStateAction<StaffCredential[]>>;
  setServicePlans: React.Dispatch<React.SetStateAction<ServicePlan[]>>;
  setCarePlans: React.Dispatch<React.SetStateAction<CarePlan[]>>;
  setAuthorizations: React.Dispatch<React.SetStateAction<Authorization[]>>;
  
  // Modal State
  modalOpen: boolean;
  modalType: ModalType;
  activeModule: DataModule | null;
  selectedItem: AnyData | null;
  
  // Modal Handlers
  openModal: (type: ModalType, module: DataModule, item?: AnyData | null) => void;
  closeModal: () => void;
  
  // CRUD
  handleCRUD: (action: 'add' | 'edit' | 'delete', module: DataModule, data: any, item?: AnyData | null) => void;
  isLoading: boolean;

  // New billing automation
  generateInvoicesFromLogs: () => void;
}

const CareFlowContext = createContext<CareFlowContextType | undefined>(undefined);

const calculateTotalHours = (data: Partial<Attendance>): number => {
    let totalMinutes = 0;

    const timeToMinutes = (time: string) => {
        if (!time) return 0;
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const amIn = timeToMinutes(data.checkInAM || '');
    const amOut = timeToMinutes(data.checkOutAM || '');
    const pmIn = timeToMinutes(data.checkInPM || '');
    const pmOut = timeToMinutes(data.checkOutPM || '');

    if (amOut > amIn) {
        totalMinutes += amOut - amIn;
    }
    if (pmOut > pmIn) {
        totalMinutes += pmOut - pmIn;
    }

    return totalMinutes / 60;
};

export const CareFlowProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  
  // Main data states
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [staff, setStaff] = useState<Staff[]>(initialStaff);
  const [attendance, setAttendance] = useState<Attendance[]>(initialAttendance);
  const [compliance, setCompliance] = useState<Compliance[]>(initialCompliance);
  const [billing, setBilling] = useState<Billing[]>(initialBilling);
  const [transportation, setTransportation] = useState<Transportation[]>(initialTransportation);
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);
  const [staffCredentials, setStaffCredentials] = useState<StaffCredential[]>(initialStaffCredentials);
  const [servicePlans, setServicePlans] = useState<ServicePlan[]>(initialServicePlans);
  const [carePlans, setCarePlans] = useState<CarePlan[]>(initialCarePlans);
  const [authorizations, setAuthorizations] = useState<Authorization[]>(initialAuthorizations);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('');
  const [activeModule, setActiveModule] = useState<DataModule | null>(null);
  const [selectedItem, setSelectedItem] = useState<AnyData | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);

  const openModal = (type: ModalType, module: DataModule, item: AnyData | null = null) => {
    setModalType(type);
    setActiveModule(module);
    setSelectedItem(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    // A slight delay to allow the dialog to animate out
    setTimeout(() => {
      setModalType('');
      setActiveModule(null);
      setSelectedItem(null);
    }, 200);
  };

  const generateInvoicesFromLogs = () => {
    setIsLoading(true);
    setTimeout(() => {
      let newInvoices: Billing[] = [];
      let generatedCount = 0;

      // Generate from attendance logs only for 'present' status
      attendance.forEach(att => {
          const alreadyBilled = billing.some(b => b.sourceLogId === `att-${att.id}`);
          if (att.status === 'present' && att.totalHours > 0 && !alreadyBilled) {
              const client = clients.find(c => c.id === att.clientId);
              const rate = SERVICE_RATES[att.serviceType] || 0;
              const amount = att.totalHours * rate;

              if (client && amount > 0) {
                  newInvoices.push({
                      id: Date.now() + generatedCount,
                      invoiceNo: `INV-${Date.now().toString().slice(-6) + generatedCount}`,
                      clientId: client.id,
                      clientName: `${client.firstName} ${client.lastName}`,
                      scheduleId: schedules.find(s => s.clientId === client.id && s.serviceType === att.serviceType)?.id || 0,
                      serviceDate: att.date,
                      serviceType: att.serviceType,
                      serviceCode: att.billingCode,
                      units: att.totalHours,
                      rate: rate,
                      amount: amount,
                      status: 'Pending',
                      createdAt: new Date().toISOString(),
                      sourceLogId: `att-${att.id}`,
                  });
                  generatedCount++;
              }
          }
      });

      // Generate from transportation logs
      transportation.forEach(trans => {
        const alreadyBilled = billing.some(b => b.sourceLogId === `trans-${trans.id}`);
        if (trans.status === 'Completed' && !alreadyBilled) {
            const client = clients.find(c => `${c.firstName} ${c.lastName}` === trans.client);
            const rate = SERVICE_RATES['Transportation'] || 0;
            if(client && rate > 0) {
              newInvoices.push({
                id: Date.now() + generatedCount,
                invoiceNo: `INV-${Date.now().toString().slice(-6) + generatedCount}`,
                clientId: client.id,
                clientName: trans.client,
                scheduleId: 0, // No direct schedule link for transportation
                serviceDate: trans.date,
                serviceType: 'Transportation',
                serviceCode: 'A0120', // Example code for non-emergency transport
                units: 1, // Per trip
                rate: rate,
                amount: rate,
                status: 'Pending',
                createdAt: new Date().toISOString(),
                sourceLogId: `trans-${trans.id}`,
              });
              generatedCount++;
            }
        }
      });

      if (newInvoices.length > 0) {
        setBilling(prev => [...prev, ...newInvoices]);
        toast({ title: "Invoices Generated", description: `${generatedCount} new draft invoice(s) have been created.` });
      } else {
        toast({ title: "No New Invoices", description: "All completed services have already been invoiced." });
      }

      setIsLoading(false);
    }, 1000);
  };

  const handleCRUD = (action: 'add' | 'edit' | 'delete', module: DataModule, data: any, item: AnyData | null = null) => {
    setIsLoading(true);
    setTimeout(() => { // Simulate API delay
      const getSingularModuleName = (moduleName: string) => {
        if (moduleName === 'staffCredentials') return 'Staff Credential';
        if (moduleName === 'staff') return 'Staff Member';
        if (moduleName === 'servicePlans') return 'Service Plan';
        if (moduleName === 'carePlans') return 'Care Plan';
        if (moduleName === 'authorizations') return 'Authorization';
        if (moduleName.endsWith('s')) return moduleName.slice(0, -1);
        return moduleName;
      }
      const singularModule = getSingularModuleName(module);
      const capitalizedModule = singularModule.charAt(0).toUpperCase() + singularModule.slice(1);

      const findClientName = (clientId: number | string) => {
        const client = clients.find(c => String(c.id) === String(clientId));
        return client ? `${client.firstName} ${client.lastName}` : 'Unknown Client';
      };
      
      const findStaffName = (staffId: number | string) => {
        const staffMember = staff.find(s => String(s.id) === String(staffId));
        return staffMember ? staffMember.name : 'Unknown Staff';
      };

      if (action === 'add') {
        let newItem: any = { id: Date.now(), createdAt: new Date().toISOString(), ...data };
        switch(module) {
          case 'clients': setClients(prev => [...prev, { ...newItem, createdAt: new Date().toISOString().slice(0, 10) }]); break;
          case 'staff': setStaff(prev => [...prev, newItem]); break;
          case 'schedules': setSchedules(prev => [...prev, { ...newItem, usedUnits: 0, createdAt: new Date().toISOString().slice(0, 10) }]); break;
          case 'staffCredentials': setStaffCredentials(prev => [...prev, newItem]); break;
          case 'servicePlans':
              newItem = { ...newItem, clientName: findClientName(newItem.clientId) };
              setServicePlans(prev => [...prev, newItem]);
              break;
          case 'carePlans':
              newItem = { ...newItem, clientName: findClientName(newItem.clientId), assignedStaff: findStaffName(newItem.assignedStaffId) };
              setCarePlans(prev => [...prev, newItem]);
              break;
          case 'authorizations':
              const servicePlan = servicePlans.find(p => String(p.id) === String(newItem.servicePlanId));
              newItem = { 
                  ...newItem,
                  clientName: findClientName(newItem.clientId),
                  servicePlan: servicePlan ? servicePlan.planName : 'Unknown',
                  serviceType: servicePlan ? servicePlan.type : 'Unknown',
                  billingCode: servicePlan ? servicePlan.billingCode : 'Unknown',
                  usedHours: 0,
              };
              setAuthorizations(prev => [...prev, newItem]);
              break;
          case 'attendance': 
            const client = clients.find(c => String(c.id) === String(newItem.clientId));
            const staffMember = staff.find(s => String(s.id) === String(newItem.staffId));
            newItem = {
                ...newItem,
                clientName: client ? `${client.firstName} ${client.lastName}` : 'Unknown',
                staffName: staffMember ? staffMember.name : 'Unknown',
                totalHours: calculateTotalHours(newItem)
            };
            setAttendance(prev => [...prev, newItem]);
            break;
          case 'compliance': setCompliance(prev => [...prev, newItem]); break;
          case 'billing':
            newItem = {
              ...newItem,
              invoiceNo: `INV-${Date.now().toString().slice(-6)}`,
              amount: (data.units || 0) * (data.rate || 0),
              clientName: findClientName(newItem.clientId),
            };
            setBilling(prev => [...prev, newItem]); 
            break;
          case 'transportation': 
            const transClient = clients.find(c => `${c.firstName} ${c.lastName}` === data.client);
            newItem = {
              ...newItem,
              clientId: transClient ? transClient.id : 0,
            };
            setTransportation(prev => [...prev, newItem]); 
            break;
        }
        toast({ title: "Success", description: `${capitalizedModule} added successfully!` });
      } else if (action === 'edit' && item) {
        let updatedItem = { ...item, ...data };
        switch(module) {
          case 'clients': setClients(prev => prev.map(c => c.id === item.id ? updatedItem as Client : c)); break;
          case 'staff': setStaff(prev => prev.map(s => s.id === item.id ? updatedItem as Staff : s)); break;
          case 'schedules': setSchedules(prev => prev.map(s => s.id === item.id ? updatedItem as Schedule : s)); break;
          case 'staffCredentials': setStaffCredentials(prev => prev.map(s => s.id === item.id ? updatedItem as StaffCredential : s)); break;
          case 'servicePlans':
              updatedItem = { ...updatedItem, clientName: findClientName(updatedItem.clientId) };
              setServicePlans(prev => prev.map(p => p.id === item.id ? updatedItem as ServicePlan : p));
              break;
          case 'carePlans':
              updatedItem = { ...updatedItem, clientName: findClientName(updatedItem.clientId), assignedStaff: findStaffName(updatedItem.assignedStaffId) };
              setCarePlans(prev => prev.map(p => p.id === item.id ? updatedItem as CarePlan : p));
              break;
          case 'authorizations':
              const servicePlan = servicePlans.find(p => String(p.id) === String(updatedItem.servicePlanId));
              updatedItem = { 
                  ...updatedItem,
                  clientName: findClientName(updatedItem.clientId),
                  servicePlan: servicePlan ? servicePlan.planName : 'Unknown',
                  serviceType: servicePlan ? servicePlan.type : 'Unknown',
                  billingCode: servicePlan ? servicePlan.billingCode : 'Unknown',
              };
              setAuthorizations(prev => prev.map(a => a.id === item.id ? updatedItem as Authorization : a));
              break;
          case 'attendance': 
            const client = clients.find(c => String(c.id) === String(updatedItem.clientId));
            const staffMember = staff.find(s => String(s.id) === String(updatedItem.staffId));
            updatedItem = {
                ...updatedItem,
                clientName: client ? `${client.firstName} ${client.lastName}` : 'Unknown',
                staffName: staffMember ? staffMember.name : 'Unknown',
                totalHours: calculateTotalHours(updatedItem)
            };
            setAttendance(prev => prev.map(a => a.id === item.id ? updatedItem as Attendance : a)); 
            break;
          case 'compliance': setCompliance(prev => prev.map(c => c.id === item.id ? updatedItem as Compliance : c)); break;
          case 'billing': 
             updatedItem = {
              ...updatedItem,
              amount: (data.units || (item as Billing).units) * (data.rate || (item as Billing).rate),
              clientName: findClientName(updatedItem.clientId),
            };
            setBilling(prev => prev.map(b => b.id === item.id ? updatedItem as Billing : b)); 
            break;
          case 'transportation': 
            const transClient = clients.find(c => `${c.firstName} ${c.lastName}` === data.client);
            updatedItem = {
              ...updatedItem,
              clientId: transClient ? transClient.id : 0,
            };
            setTransportation(prev => prev.map(t => t.id === item.id ? updatedItem as Transportation : t)); break;
        }
        toast({ title: "Success", description: `${capitalizedModule} updated successfully!` });
      } else if (action === 'delete' && item) {
        switch(module) {
          case 'clients': setClients(prev => prev.filter(c => c.id !== item.id)); break;
          case 'staff': setStaff(prev => prev.filter(s => s.id !== item.id)); break;
          case 'schedules': setSchedules(prev => prev.filter(s => s.id !== item.id)); break;
          case 'staffCredentials': setStaffCredentials(prev => prev.filter(c => c.id !== item.id)); break;
          case 'servicePlans': setServicePlans(prev => prev.filter(p => p.id !== item.id)); break;
          case 'carePlans': setCarePlans(prev => prev.filter(p => p.id !== item.id)); break;
          case 'authorizations': setAuthorizations(prev => prev.filter(a => a.id !== item.id)); break;
          case 'attendance': setAttendance(prev => prev.filter(a => a.id !== item.id)); break;
          case 'compliance': setCompliance(prev => prev.filter(c => c.id !== item.id)); break;
          case 'billing': setBilling(prev => prev.filter(b => b.id !== item.id)); break;
          case 'transportation': setTransportation(prev => prev.filter(t => t.id !== item.id)); break;
        }
        toast({ title: "Success", description: `${capitalizedModule} deleted successfully.` });
      }
      
      closeModal();
      setIsLoading(false);
    }, 800);
  };
  
  const value = {
    clients,
    staff,
    attendance,
    compliance,
    billing,
    transportation,
    schedules,
    staffCredentials,
    servicePlans,
    carePlans,
    authorizations,
    setClients,
    setStaff,
    setSchedules,
    setAttendance,
    setStaffCredentials,
    setServicePlans,
    setCarePlans,
    setAuthorizations,
    modalOpen,
    modalType,
    activeModule,
    selectedItem,
    openModal,
    closeModal,
    handleCRUD,
    isLoading,
    generateInvoicesFromLogs,
  };

  return (
    <CareFlowContext.Provider value={value}>
      {children}
    </CareFlowContext.Provider>
  );
};

export const useCareFlow = () => {
  const context = useContext(CareFlowContext);
  if (context === undefined) {
    throw new Error('useCareFlow must be used within a CareFlowProvider');
  }
  return context;
};
