'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import { 
  initialClients, 
  initialStaff, 
  initialCompliance, 
  initialBilling, 
  initialTransportation, 
  initialSchedules, 
  initialStaffCredentials,
  initialServicePlans,
  initialCarePlans,
  initialAuthorizations,
  initialAttendance
} from '@/lib/data';
import type { 
  Client, 
  Staff, 
  Compliance, 
  Billing, 
  Transportation, 
  Schedule, 
  DataModule, 
  AnyData, 
  StaffCredential,
  ServicePlan,
  CarePlan,
  Authorization,
  Attendance
} from '@/lib/types';
import { eachDayOfInterval, format, isMatch, parse, differenceInMinutes, isValid } from 'date-fns';

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
  setStaffCredentials: React.Dispatch<React.SetStateAction<StaffCredential[]>>;
  setServicePlans: React.Dispatch<React.SetStateAction<ServicePlan[]>>;
  setCarePlans: React.Dispatch<React.SetStateAction<CarePlan[]>>;
  setAuthorizations: React.Dispatch<React.SetStateAction<Authorization[]>>;
  setAttendance: React.Dispatch<React.SetStateAction<Attendance[]>>;
  
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

  const handleBulkAddAttendance = (data: any) => {
    const { client, staff, serviceType, billingCode, logs } = data;
    let createdCount = 0;
    let updatedCount = 0;

    const newAttendanceLogs: Attendance[] = [];
    const updatedAttendanceLogs = new Map<number, Attendance>();

    logs.forEach((log: any) => {
      if (log.status !== 'present' || !log.checkInAM || !log.checkOutAM) {
          // You might want to handle absent/excused logs differently or just skip.
          // For now, we will create/update them to store the status and notes
      }
      const calculateHours = (timeInStr: string, timeOutStr: string) => {
        if (!timeInStr || !timeOutStr) return 0;
        const timeIn = parse(timeInStr, 'HH:mm', new Date());
        const timeOut = parse(timeOutStr, 'HH:mm', new Date());
        if (isValid(timeIn) && isValid(timeOut) && timeOut > timeIn) {
            return differenceInMinutes(timeOut, timeIn) / 60;
        }
        return 0;
      };

      const totalHours = calculateHours(log.checkInAM, log.checkOutAM) + calculateHours(log.checkInPM, log.checkOutPM);
      
      const existingLog = attendance.find(a => 
        a.clientId === client.id && 
        format(new Date(a.date + 'T00:00:00'), 'yyyy-MM-dd') === log.date
      );
      
      const attendanceEntry: Omit<Attendance, 'id'> = {
        clientId: client.id,
        clientName: `${client.firstName} ${client.lastName}`,
        staffId: staff.id,
        staffName: staff.name,
        serviceType: serviceType,
        date: log.date,
        checkInAM: log.checkInAM,
        checkOutAM: log.checkOutAM,
        checkInPM: log.checkInPM,
        checkOutPM: log.checkOutPM,
        totalHours: totalHours,
        location: 'Daycare Center',
        billingCode: billingCode,
        status: log.status,
        notes: log.notes,
        createdAt: new Date().toISOString(),
      };

      if (existingLog) {
          updatedAttendanceLogs.set(existingLog.id, { ...existingLog, ...attendanceEntry, id: existingLog.id });
          updatedCount++;
      } else {
          newAttendanceLogs.push({ ...attendanceEntry, id: Date.now() + createdCount });
          createdCount++;
      }
    });

    setAttendance(prev => {
        const updatedPrev = prev.map(p => updatedAttendanceLogs.has(p.id) ? updatedAttendanceLogs.get(p.id)! : p);
        return [...updatedPrev, ...newAttendanceLogs];
    });

    toast({ title: 'Attendance Processed', description: `${createdCount} logs created, ${updatedCount} logs updated.` });
    closeModal();
    setIsLoading(false);
  };


  const handleCRUD = (action: 'add' | 'edit' | 'delete', module: DataModule, data: any, item: AnyData | null = null) => {
    setIsLoading(true);

    if(module === 'attendance' && (item as any)?.bulk) {
      setTimeout(() => handleBulkAddAttendance(data), 800);
      return;
    }
    
    setTimeout(() => { // Simulate API delay
      const getSingularModuleName = (moduleName: string) => {
        if (moduleName === 'staffCredentials') return 'Staff Credential';
        if (moduleName === 'staff') return 'Staff Member';
        if (moduleName === 'servicePlans') return 'Service Plan';
        if (moduleName === 'carePlans') return 'Care Plan';
        if (moduleName === 'authorizations') return 'Authorization';
        if (moduleName === 'attendance') return 'Attendance Log';
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
          case 'servicePlans': setServicePlans(prev => [...prev, newItem]); break;
          case 'carePlans': setCarePlans(prev => [...prev, newItem]); break;
          case 'authorizations': setAuthorizations(prev => [...prev, newItem]); break;
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
          case 'attendance':
             const calculateHours = (timeInStr: string, timeOutStr: string) => {
                if (!timeInStr || !timeOutStr) return 0;
                const timeIn = parse(timeInStr, 'HH:mm', new Date());
                const timeOut = parse(timeOutStr, 'HH:mm', new Date());
                if (isValid(timeIn) && isValid(timeOut) && timeOut > timeIn) {
                    return differenceInMinutes(timeOut, timeIn) / 60;
                }
                return 0;
             };
             const totalHours = calculateHours(data.checkInAM, data.checkOutAM) + calculateHours(data.checkInPM, data.checkOutPM);
             newItem = {
                ...newItem,
                clientName: findClientName(data.clientId),
                staffName: findStaffName(data.staffId),
                totalHours: totalHours,
                location: 'Daycare Center'
             };
             setAttendance(prev => [...prev, newItem]);
             break;
        }
        toast({ title: "Success", description: `${capitalizedModule} added successfully!` });
      } else if (action === 'edit' && item) {
        let updatedItem: any = { ...item, ...data };
        switch(module) {
          case 'clients': setClients(prev => prev.map(c => c.id === item.id ? updatedItem as Client : c)); break;
          case 'staff': setStaff(prev => prev.map(s => s.id === item.id ? updatedItem as Staff : s)); break;
          case 'schedules': setSchedules(prev => prev.map(s => s.id === item.id ? updatedItem as Schedule : s)); break;
          case 'staffCredentials': setStaffCredentials(prev => prev.map(s => s.id === item.id ? updatedItem as StaffCredential : s)); break;
          case 'servicePlans': setServicePlans(prev => prev.map(p => p.id === item.id ? updatedItem as ServicePlan : p)); break;
          case 'carePlans': setCarePlans(prev => prev.map(p => p.id === item.id ? updatedItem as CarePlan : p)); break;
          case 'authorizations': setAuthorizations(prev => prev.map(a => a.id === item.id ? updatedItem as Authorization : a)); break;
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
          case 'attendance':
             const calculateHours = (timeInStr: string, timeOutStr: string) => {
                if (!timeInStr || !timeOutStr) return 0;
                const timeIn = parse(timeInStr, 'HH:mm', new Date());
                const timeOut = parse(timeOutStr, 'HH:mm', new Date());
                if (isValid(timeIn) && isValid(timeOut) && timeOut > timeIn) {
                    return differenceInMinutes(timeOut, timeIn) / 60;
                }
                return 0;
             };
             const totalHours = calculateHours(data.checkInAM, data.checkOutAM) + calculateHours(data.checkInPM, data.checkOutPM);
             updatedItem = {
                ...updatedItem,
                clientName: findClientName(data.clientId),
                staffName: findStaffName(data.staffId),
                totalHours: totalHours,
             };
             setAttendance(prev => prev.map(a => a.id === item.id ? updatedItem as Attendance : a));
             break;
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
          case 'compliance': setCompliance(prev => prev.filter(c => c.id !== item.id)); break;
          case 'billing': setBilling(prev => prev.filter(b => b.id !== item.id)); break;
          case 'transportation': setTransportation(prev => prev.filter(t => t.id !== item.id)); break;
          case 'attendance': setAttendance(prev => prev.filter(a => a.id !== item.id)); break;
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
    setAttendance,
    setSchedules,
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
