import type { Client, Staff, Attendance, Compliance, Billing, Transportation, Schedule, StaffCredential, ServicePlan, CarePlan, Authorization } from './types';
import { format, subDays } from 'date-fns';

const today = new Date();
const yesterday = subDays(today, 1);
const twoDaysAgo = subDays(today, 2);

export const initialClients: Client[] = [
    { 
      id: 101, 
      firstName: 'John', 
      lastName: 'Doe',
      dob: '1978-02-15',
      gender: 'Male',
      phone: '614-222-5555', 
      email: 'john.doe@example.com', 
      address: '123 Wellness Rd', 
      city: 'Columbus',
      state: 'OH',
      zip: '43215',
      providerName: 'Direct Care Home Health',
      caseManager: 'Mary Collins, RN',
      caseManagerPhone: '614-555-2384',
      caseManagerEmail: 'mary.collins@ohiomedicaid.gov',
      insurance: 'Aetna Managed Care',
      insuranceSecondary: 'Medicare Part B',
      medicaidId: '123456789',
      status: 'active',
      createdAt: '2024-01-15'
    },
    { 
      id: 102, 
      firstName: 'Sarah', 
      lastName: 'Johnson', 
      dob: '1965-08-22',
      gender: 'Female',
      phone: '614-333-6666', 
      email: 'sarah.j@example.com', 
      address: '456 Health Ave', 
      city: 'Columbus',
      state: 'OH',
      zip: '43220',
      providerName: 'Direct Care Home Health',
      caseManager: 'Sarah Jones',
      caseManagerPhone: '614-555-2233',
      caseManagerEmail: 'sjones@medicaid.gov',
      insurance: 'Medicaid',
      status: 'active',
      createdAt: '2024-02-20'
    },
    { 
      id: 103, 
      firstName: 'Mike', 
      lastName: 'Williams', 
      dob: '1950-11-01',
      gender: 'Male',
      phone: '614-444-7777', 
      email: 'mike.w@example.com', 
      address: '789 Care Street', 
      city: 'Columbus',
      state: 'OH',
      zip: '43235',
      providerName: 'CareLink Services',
      caseManager: 'Michael Brown',
      caseManagerPhone: '614-555-3344',
      caseManagerEmail: 'mbrown@medicaid.gov',
      insurance: 'Private Insurance',
      status: 'active',
      createdAt: '2024-03-10'
    },
    { 
      id: 104,
      firstName: 'Emily', 
      lastName: 'Davis', 
      dob: '1982-04-30',
      gender: 'Female',
      phone: '614-555-8888', 
      email: 'emily.d@example.com', 
      address: '321 Oak Lane', 
      city: 'Dublin',
      state: 'OH',
      zip: '43016',
      providerName: 'Wellness Partners Inc',
      caseManager: 'Jennifer Lee',
      caseManagerPhone: '614-555-4455',
      caseManagerEmail: 'jlee@medicaid.gov',
      insurance: 'Medicare',
      status: 'inactive',
      createdAt: '2024-04-05'
    },
  ];

  export const initialStaff: Staff[] = [
    { id: 201, name: 'Dr. Sarah Mitchell', role: 'Medical Director', phone: '614-111-2222', email: 'sarah.m@carecloud.com', emergencyContactName: 'Mark Mitchell', emergencyContactPhone: '614-111-2223', status: 'Active', schedule: 'Mon-Fri', department: 'Medical' },
    { id: 202, name: 'John Caregiver', role: 'Senior Caregiver', phone: '614-222-3333', email: 'john.c@carecloud.com', emergencyContactName: 'Jane Caregiver', emergencyContactPhone: '614-222-3334', status: 'Active', schedule: 'Mon-Fri', department: 'Care' },
    { id: 203, name: 'Lisa Nurse', role: 'Registered Nurse', phone: '614-333-4444', email: 'lisa.n@carecloud.com', emergencyContactName: 'Tom Nurse', emergencyContactPhone: '614-333-4445', status: 'Active', schedule: 'Tue-Sat', department: 'Medical' },
    { id: 204, name: 'David Smith', role: 'Caregiver', phone: '614-444-5555', email: 'david.s@carecloud.com', emergencyContactName: 'Mary Smith', emergencyContactPhone: '614-444-5556', status: 'Inactive', schedule: 'Flexible', department: 'Care' },
  ];

  export const initialStaffCredentials: StaffCredential[] = [
    { id: 301, staffId: 201, staffName: 'Dr. Sarah Mitchell', role: 'Medical Director', credential: 'MD License', training: 'Advanced Cardiac Life Support', hrDocument: 'Annual Contract', startDate: '2024-01-01', expirationDate: '2025-12-31', renewalDate: '2025-12-01', isCritical: true, status: 'Active', actionTaken: 'None' },
    { id: 302, staffId: 202, staffName: 'John Caregiver', role: 'Senior Caregiver', credential: 'CNA', training: 'First Aid', hrDocument: 'Employment Agreement', startDate: '2023-05-15', expirationDate: '2025-05-14', renewalDate: '2025-04-15', isCritical: true, status: 'Active', actionTaken: 'None' },
    { id: 303, staffId: 203, staffName: 'Lisa Nurse', role: 'Registered Nurse', credential: 'RN License', training: 'Basic Life Support', hrDocument: 'Background Check', startDate: '2022-08-01', expirationDate: '2024-07-31', renewalDate: '2024-07-01', isCritical: false, status: 'Expired', actionTaken: 'Renewal notice sent' },
    { id: 304, staffId: 203, staffName: 'Lisa Nurse', role: 'Registered Nurse', credential: 'CPR Certification', training: 'N/A', hrDocument: 'N/A', startDate: '2024-09-01', expirationDate: '2025-08-31', renewalDate: '2025-08-01', isCritical: true, status: 'Expiring Soon', actionTaken: 'Scheduled for class' },
  ];

  export const initialSchedules: Schedule[] = [
    { 
      id: 401, 
      clientId: 101,
      clientName: 'John Doe', 
      staffId: 202,
      staffName: 'John Caregiver',
      serviceType: 'Adult Day Care', 
      serviceCode: 'T2021',
      frequency: 'Weekly',
      totalUnits: 60,
      usedUnits: 24,
      hoursPerDay: 6.5,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      days: ['Monday', 'Wednesday', 'Friday'],
      status: 'active',
      createdAt: '2023-12-15'
    },
    { 
      id: 402, 
      clientId: 102,
      clientName: 'Sarah Johnson', 
      staffId: 203,
      staffName: 'Lisa Nurse',
      serviceType: 'Personal Care', 
      serviceCode: 'T1019',
      frequency: 'Daily',
      totalUnits: 120,
      usedUnits: 85,
      hoursPerDay: 4,
      startDate: '2024-02-01',
      endDate: '2024-11-30',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      status: 'active',
      createdAt: '2024-01-20'
    },
    { 
      id: 403, 
      clientId: 103,
      clientName: 'Mike Williams', 
      staffId: 202,
      staffName: 'John Caregiver',
      serviceType: 'Day Support', 
      serviceCode: 'T2021',
      frequency: 'Weekly',
      totalUnits: 40,
      usedUnits: 40,
      hoursPerDay: 5,
      startDate: '2023-06-01',
      endDate: '2024-05-31',
      days: ['Monday', 'Wednesday'],
      status: 'expired',
      createdAt: '2023-05-15'
    },
    { 
      id: 404, 
      clientId: 101,
      clientName: 'John Doe',
      staffId: 201,
      staffName: 'Dr. Sarah Mitchell',
      serviceType: 'Medical Check-up', 
      serviceCode: 'T1002',
      frequency: 'Monthly',
      totalUnits: 12,
      usedUnits: 10,
      hoursPerDay: 1,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      days: ['Friday'],
      status: 'active',
      createdAt: '2023-12-20'
    },
  ];

  export const initialAttendance: Attendance[] = [
    { id: 501, clientId: 101, clientName: 'John Doe', staffId: 202, staffName: 'John Caregiver', serviceType: 'Adult Day Care', date: format(today, 'yyyy-MM-dd'), checkInAM: '09:00', checkOutAM: '12:00', checkInPM: '13:00', checkOutPM: '15:30', totalHours: 5.5, location: 'Daycare Center', billingCode: 'T2021', status: 'present', notes: 'Regular day', createdAt: today.toISOString() },
    { id: 502, clientId: 102, clientName: 'Sarah Johnson', staffId: 203, staffName: 'Lisa Nurse', serviceType: 'Personal Care', date: format(today, 'yyyy-MM-dd'), checkInAM: '08:45', checkOutAM: '12:00', checkInPM: '12:30', checkOutPM: '15:15', totalHours: 6, location: 'Daycare Center', billingCode: 'T1019', status: 'present', notes: '', createdAt: today.toISOString() },
    { id: 503, clientId: 103, clientName: 'Mike Williams', staffId: 202, staffName: 'John Caregiver', serviceType: 'Day Support', date: format(yesterday, 'yyyy-MM-dd'), checkInAM: null, checkOutAM: null, checkInPM: null, checkOutPM: null, totalHours: 0, location: 'Home Visit', billingCode: 'T2021', status: 'excused', notes: 'Medical appt in afternoon', createdAt: yesterday.toISOString() },
    { id: 504, clientId: 101, clientName: 'John Doe', staffId: 202, staffName: 'John Caregiver', serviceType: 'Adult Day Care', date: format(yesterday, 'yyyy-MM-dd'), checkInAM: '09:02', checkOutAM: '12:05', checkInPM: '13:00', checkOutPM: '15:33', totalHours: 5.5, location: 'Daycare Center', billingCode: 'T2021', status: 'present', notes: '', createdAt: yesterday.toISOString() },
    { id: 505, clientId: 101, clientName: 'John Doe', staffId: 202, staffName: 'John Caregiver', serviceType: 'Adult Day Care', date: format(twoDaysAgo, 'yyyy-MM-dd'), checkInAM: null, checkOutAM: null, checkInPM: null, checkOutPM: null, totalHours: 0, location: 'Daycare Center', billingCode: 'T2021', status: 'absent', notes: 'No show', createdAt: twoDaysAgo.toISOString() },
];
  
  export const initialBilling: Billing[] = [
    { id: 601, invoiceNo: 'INV-2024-001', clientId: 101, clientName: 'John Doe', scheduleId: 401, serviceDate: '2024-05-15', serviceType: 'Adult Day Care', serviceCode: 'T2021', units: 6.5, rate: 25, amount: 162.5, status: 'Paid', createdAt: '2024-05-20', sourceLogId: 'att-504' },
    { id: 602, invoiceNo: 'INV-2024-002', clientId: 102, clientName: 'Sarah Johnson', scheduleId: 402, serviceDate: '2024-05-19', serviceType: 'Personal Care', serviceCode: 'T1019', units: 4, rate: 30, amount: 120, status: 'Submitted', createdAt: '2024-05-20' },
    { id: 603, invoiceNo: 'INV-2024-003', clientId: 103, clientName: 'Mike Williams', scheduleId: 403, serviceDate: '2024-05-10', serviceType: 'Day Support', serviceCode: 'S5150', units: 5, rate: 28, amount: 140, status: 'Paid', createdAt: '2024-05-18' },
    { id: 604, invoiceNo: 'INV-2024-004', clientId: 101, clientName: 'John Doe', scheduleId: 401, serviceDate: '2024-05-08', serviceType: 'Adult Day Care', serviceCode: 'T2021', units: 6.5, rate: 25, amount: 162.5, status: 'Denied', createdAt: '2024-05-10' },
  ];
  
  export const initialTransportation: Transportation[] = [
    { id: 701, clientId: 101, client: 'John Doe', driver: 'Mike Driver', pickup: '08:30', dropoff: '16:00', route: 'Route A', status: 'Scheduled', date: format(today, 'yyyy-MM-dd') },
    { id: 702, clientId: 102, client: 'Sarah Johnson', driver: 'Lisa Driver', pickup: '08:15', dropoff: '15:45', route: 'Route B', status: 'Completed', date: format(yesterday, 'yyyy-MM-dd') },
    { id: 703, clientId: 103, client: 'Mike Williams', driver: 'Mike Driver', pickup: '09:00', dropoff: '14:30', route: 'Route A', status: 'Completed', date: format(twoDaysAgo, 'yyyy-MM-dd') },
  ];
  
  export const initialServicePlans: ServicePlan[] = [
    { id: 801, clientId: 101, clientName: 'John Doe', planName: 'Standard Day Care', type: 'Personal Care', billingCode: 'T2021', startDate: '2024-01-01', endDate: '2024-12-31', status: 'Active' },
    { id: 802, clientId: 102, clientName: 'Sarah Johnson', planName: 'Enhanced Personal Support', type: 'Personal Care', billingCode: 'T1019', startDate: '2024-01-01', endDate: '2024-12-31', status: 'Active' },
    { id: 803, clientId: 103, clientName: 'Mike Williams', planName: 'Socialization & Activities', type: 'Social', billingCode: 'S5100', startDate: '2024-01-01', endDate: '2024-12-31', status: 'Active' },
    { id: 804, clientId: 101, clientName: 'John Doe', planName: 'Medical Monitoring 2023', type: 'Medical', billingCode: 'T1002', startDate: '2023-01-01', endDate: '2023-12-31', status: 'Expired' },
  ];

  export const initialCarePlans: CarePlan[] = [
    { id: 901, clientId: 101, clientName: 'John Doe', planName: 'John\'s Daily Support', assignedStaffId: 202, assignedStaff: 'John Caregiver', startDate: '2024-01-01', endDate: '2024-06-30', goals: 'Improve mobility and social interaction.', status: 'Active' },
    { id: 902, clientId: 102, clientName: 'Sarah Johnson', planName: 'Sarah\'s Nursing Care', assignedStaffId: 203, assignedStaff: 'Lisa Nurse', startDate: '2024-01-01', endDate: '2024-12-31', goals: 'Manage medication and monitor vital signs.', status: 'Active' },
    { id: 903, clientId: 103, clientName: 'Mike Williams', planName: 'Mike\'s Community Engagement', assignedStaffId: 202, assignedStaff: 'John Caregiver', startDate: '2024-03-01', endDate: '2024-09-01', goals: 'Attend community events twice a week.', status: 'Pending' },
  ];
  
  export const initialAuthorizations: Authorization[] = [
    { id: 1001, clientId: 101, servicePlanId: 801, clientName: 'John Doe', servicePlan: 'Standard Day Care', serviceType: 'Personal Care', billingCode: 'T2021', authorizedHours: 120, usedHours: 45.5, startDate: '2024-01-01', endDate: '2024-06-30', status: 'Active' },
    { id: 1002, clientId: 102, servicePlanId: 802, clientName: 'Sarah Johnson', servicePlan: 'Enhanced Personal Support', serviceType: 'Personal Care', billingCode: 'T1019', authorizedHours: 80, usedHours: 80, startDate: '2024-01-01', endDate: '2024-03-31', status: 'Expired' },
    { id: 1003, clientId: 103, servicePlanId: 803, clientName: 'Mike Williams', servicePlan: 'Socialization & Activities', serviceType: 'Social', billingCode: 'S5100', authorizedHours: 50, usedHours: 15, startDate: '2024-02-01', endDate: '2024-07-31', status: 'Active' },
  ];

  export const initialCompliance: Compliance[] = [
    { id: 1101, client: 'John Doe', clientId: 101, type: 'Authorization', item: 'Service Authorization', status: 'Expiring Soon', dueDate: '2024-10-25', daysLeft: 6 },
    { id: 1102, client: 'Sarah Johnson', clientId: 102, type: 'Document', item: 'Medical Assessment', status: 'Expired', dueDate: '2024-10-15', daysLeft: -4 },
    { id: 1103, client: 'Mike Williams', clientId: 103, type: 'Authorization', item: 'Service Authorization', status: 'Current', dueDate: '2024-12-30', daysLeft: 72 },
  ];
