import type { Client, Staff, Attendance, Compliance, Billing, Transportation, Schedule, StaffCredential, ServicePlan, CarePlan, Authorization } from './types';

export const initialClients: Client[] = [
    { 
      id: 1, 
      firstName: 'John', 
      lastName: 'Doe',
      dob: '1978-02-15',
      gender: 'Male',
      phone: '614-222-5555', 
      email: 'john@client.com', 
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
      serviceCode: 'T2021',
      createdAt: '2024-01-15'
    },
    { 
      id: 2, 
      firstName: 'Sarah', 
      lastName: 'Johnson', 
      dob: '1965-08-22',
      gender: 'Female',
      phone: '614-333-6666', 
      email: 'sarah.j@email.com', 
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
      serviceCode: 'T2021',
      createdAt: '2024-02-20'
    },
    { 
      id: 3, 
      firstName: 'Mike', 
      lastName: 'Williams', 
      dob: '1950-11-01',
      gender: 'Male',
      phone: '614-444-7777', 
      email: 'mike.w@email.com', 
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
      serviceCode: 'T2021',
      createdAt: '2024-03-10'
    },
    { 
      id: 4,
      firstName: 'Emily', 
      lastName: 'Davis', 
      dob: '1982-04-30',
      gender: 'Female',
      phone: '614-555-8888', 
      email: 'emily.d@email.com', 
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
      serviceCode: 'T2021',
      createdAt: '2024-04-05'
    },
  ];

  export const initialStaff: Staff[] = [
    { id: 1, name: 'Dr. Sarah Mitchell', role: 'Medical Director', phone: '614-111-2222', email: 'sarah.m@carecloud.com', emergencyContactName: 'Mark Mitchell', emergencyContactPhone: '614-111-2223', status: 'Active', schedule: 'Mon-Fri', department: 'Medical' },
    { id: 2, name: 'John Caregiver', role: 'Senior Caregiver', phone: '614-222-3333', email: 'john.c@carecloud.com', emergencyContactName: 'Jane Caregiver', emergencyContactPhone: '614-222-3334', status: 'Active', schedule: 'Mon-Fri', department: 'Care' },
    { id: 3, name: 'Lisa Nurse', role: 'Registered Nurse', phone: '614-333-4444', email: 'lisa.n@carecloud.com', emergencyContactName: 'Tom Nurse', emergencyContactPhone: '614-333-4445', status: 'Active', schedule: 'Tue-Sat', department: 'Medical' },
    { id: 4, name: 'David Smith', role: 'Caregiver', phone: '614-444-5555', email: 'david.s@carecloud.com', emergencyContactName: 'Mary Smith', emergencyContactPhone: '614-444-5556', status: 'Inactive', schedule: 'Flexible', department: 'Care' },
  ];

  export const initialStaffCredentials: StaffCredential[] = [
    { id: 1, staffId: 1, staffName: 'Dr. Sarah Mitchell', role: 'Medical Director', credential: 'MD License', training: 'Advanced Cardiac Life Support', hrDocument: 'Annual Contract', startDate: '2024-01-01', expirationDate: '2025-12-31', renewalDate: '2025-12-01', isCritical: true, status: 'Active', actionTaken: 'None' },
    { id: 2, staffId: 2, staffName: 'John Caregiver', role: 'Senior Caregiver', credential: 'CNA', training: 'First Aid', hrDocument: 'Employment Agreement', startDate: '2023-05-15', expirationDate: '2025-05-14', renewalDate: '2025-04-15', isCritical: true, status: 'Active', actionTaken: 'None' },
    { id: 3, staffId: 3, staffName: 'Lisa Nurse', role: 'Registered Nurse', credential: 'RN License', training: 'Basic Life Support', hrDocument: 'Background Check', startDate: '2022-08-01', expirationDate: '2024-07-31', renewalDate: '2024-07-01', isCritical: false, status: 'Expired', actionTaken: 'Renewal notice sent' },
    { id: 4, staffId: 3, staffName: 'Lisa Nurse', role: 'Registered Nurse', credential: 'CPR Certification', training: 'N/A', hrDocument: 'N/A', startDate: '2024-09-01', expirationDate: '2025-08-31', renewalDate: '2025-08-01', isCritical: true, status: 'Expiring Soon', actionTaken: 'Scheduled for class' },
    { id: 5, staffId: 1, staffName: 'Dr. Sarah Mitchell', credential: 'Board Certification', training: 'N/A', hrDocument: 'N/A', startDate: '2022-01-01', expirationDate: '2024-12-31', renewalDate: '2024-12-01', isCritical: true, status: 'Expiring Soon', actionTaken: 'Renewal application submitted' },
    { id: 6, staffId: 2, staffName: 'John Caregiver', credential: 'Background Check', training: 'N/A', hrDocument: 'N/A', startDate: '2023-05-10', expirationDate: '2025-05-10', renewalDate: '2025-04-10', isCritical: true, status: 'Active', actionTaken: 'None' },
  ];

  export const initialAttendance: Attendance[] = [
    { id: 1, clientId: 1, clientName: 'John Doe', staffId: 2, staffName: 'John Caregiver', serviceType: 'Adult Day Care', date: '2025-10-19', checkInAM: '09:00', checkOutAM: '12:00', checkInPM: '13:00', checkOutPM: '15:30', totalHours: 5.5, location: 'Daycare Center', billingCode: 'T2021', status: 'present', notes: 'Regular day', createdAt: '2025-10-19T15:30:00Z' },
    { id: 2, clientId: 2, clientName: 'Sarah Johnson', staffId: 3, staffName: 'Lisa Nurse', serviceType: 'Personal Care', date: '2025-10-19', checkInAM: '08:45', checkOutAM: '12:00', checkInPM: '12:30', checkOutPM: '15:15', totalHours: 6, location: 'Daycare Center', billingCode: 'T1019', status: 'present', notes: '', createdAt: '2025-10-19T15:15:00Z' },
    { id: 3, clientId: 3, clientName: 'Mike Williams', staffId: 2, staffName: 'John Caregiver', serviceType: 'Day Support', date: '2025-10-19', checkInAM: '09:15', checkOutAM: '12:15', checkInPM: '', checkOutPM: '', totalHours: 3, location: 'Home Visit', billingCode: 'T2021', status: 'excused', notes: 'Medical appt in afternoon', createdAt: '2025-10-19T12:15:00Z' },
    { id: 4, clientId: 1, clientName: 'John Doe', staffId: 2, staffName: 'John Caregiver', serviceType: 'Adult Day Care', date: '2025-10-18', checkInAM: '09:02', checkOutAM: '12:05', checkInPM: '13:00', checkOutPM: '15:33', totalHours: 5.5, location: 'Daycare Center', billingCode: 'T2021', status: 'present', notes: '', createdAt: '2025-10-18T15:33:00Z' },
];

  export const initialCompliance: Compliance[] = [
    { id: 1, client: 'John Doe', type: 'Authorization', item: 'Service Authorization', status: 'Expiring Soon', dueDate: '2025-10-25', daysLeft: 6 },
    { id: 2, client: 'Sarah Johnson', type: 'Document', item: 'Medical Assessment', status: 'Expired', dueDate: '2025-10-15', daysLeft: -4 },
    { id: 3, client: 'Mike Williams', type: 'Authorization', item: 'Service Authorization', status: 'Current', dueDate: '2025-12-30', daysLeft: 72 },
  ];

  export const initialBilling: Billing[] = [
    { id: 1, invoiceNo: 'INV-2025-001', clientId: 1, clientName: 'John Doe', scheduleId: 1, serviceDate: '2025-10-19', serviceType: 'Adult Day Care', serviceCode: 'T2021', units: 6.5, rate: 150, amount: 975, status: 'Pending', createdAt: '2025-10-20', sourceLogId: 'att-1' },
    { id: 2, invoiceNo: 'INV-2025-002', clientId: 2, clientName: 'Sarah Johnson', scheduleId: 2, serviceDate: '2025-10-19', serviceType: 'Personal Care', serviceCode: 'T1019', units: 6, rate: 120, amount: 720, status: 'Submitted', createdAt: '2025-10-20' },
    { id: 3, invoiceNo: 'INV-2025-003', clientId: 3, clientName: 'Mike Williams', scheduleId: 3, serviceDate: '2025-10-19', serviceType: 'Day Support', serviceCode: 'S5150', units: 4.75, rate: 150, amount: 712.5, status: 'Paid', createdAt: '2025-10-18' },
    { id: 4, invoiceNo: 'INV-2025-004', clientId: 1, clientName: 'John Doe', scheduleId: 1, serviceDate: '2025-10-18', serviceType: 'Adult Day Care', serviceCode: 'T2021', units: 6.5, rate: 150, amount: 975, status: 'Denied', createdAt: '2025-10-19', sourceLogId: 'att-4' },
  ];

  export const initialTransportation: Transportation[] = [
    { id: 1, clientId: 1, client: 'John Doe', driver: 'Mike Driver', pickup: '08:30', dropoff: '16:00', route: 'Route A', status: 'Scheduled', date: '2025-10-20' },
    { id: 2, clientId: 2, client: 'Sarah Johnson', driver: 'Lisa Driver', pickup: '08:15', dropoff: '15:45', route: 'Route B', status: 'In Progress', date: '2025-10-19' },
    { id: 3, clientId: 3, client: 'Mike Williams', driver: 'Mike Driver', pickup: '09:00', dropoff: '14:30', route: 'Route A', status: 'Completed', date: '2025-10-18' },
  ];

  export const initialSchedules: Schedule[] = [
    { 
      id: 1, 
      clientId: 1,
      clientName: 'John Doe', 
      staffId: 2,
      staffName: 'John Caregiver',
      serviceType: 'Adult Day Care', 
      serviceCode: 'T2021',
      frequency: 'Weekly',
      totalUnits: 60,
      usedUnits: 24,
      hoursPerDay: 6.5,
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      days: ['Monday', 'Wednesday', 'Friday'],
      status: 'active',
      createdAt: '2024-12-15'
    },
    { 
      id: 2, 
      clientId: 2,
      clientName: 'Sarah Johnson', 
      staffId: 3,
      staffName: 'Lisa Nurse',
      serviceType: 'Personal Care', 
      serviceCode: 'T1019',
      frequency: 'Daily',
      totalUnits: 120,
      usedUnits: 85,
      hoursPerDay: 4,
      startDate: '2025-02-01',
      endDate: '2025-11-30',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      status: 'active',
      createdAt: '2025-01-20'
    },
    { 
      id: 3, 
      clientId: 3,
      clientName: 'Mike Williams', 
      staffId: 2,
      staffName: 'John Caregiver',
      serviceType: 'Day Support', 
      serviceCode: 'T2021',
      frequency: 'Weekly',
      totalUnits: 40,
      usedUnits: 40,
      hoursPerDay: 5,
      startDate: '2024-06-01',
      endDate: '2025-05-31',
      days: ['Monday', 'Wednesday'],
      status: 'expired',
      createdAt: '2024-05-15'
    },
    { 
      id: 4, 
      clientId: 1,
      clientName: 'John Doe',
      staffId: 1,
      staffName: 'Dr. Sarah Mitchell',
      serviceType: 'Medical Check-up', 
      serviceCode: 'T1002',
      frequency: 'Monthly',
      totalUnits: 12,
      usedUnits: 10,
      hoursPerDay: 1,
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      days: ['Friday'],
      status: 'active',
      createdAt: '2024-12-20'
    },
     { 
      id: 5, 
      clientId: 1,
      clientName: 'John Doe', 
      staffId: 3,
      staffName: 'Lisa Nurse',
      serviceType: 'Physical Therapy', 
      serviceCode: 'G0151',
      frequency: 'Weekly',
      totalUnits: 52,
      usedUnits: 20,
      hoursPerDay: 1,
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      days: ['Tuesday', 'Thursday'],
      status: 'active',
      createdAt: '2024-12-18'
    },
  ];

  export const initialServicePlans: ServicePlan[] = [
    { id: 1, clientId: 1, clientName: 'John Doe', planName: 'Standard Day Care', type: 'Personal Care', billingCode: 'T2021', status: 'Active', startDate: '2024-01-01', endDate: '2024-12-31' },
    { id: 2, clientId: 2, clientName: 'Sarah Johnson', planName: 'Enhanced Personal Support', type: 'Personal Care', billingCode: 'T1019', status: 'Active', startDate: '2024-01-01', endDate: '2024-12-31' },
    { id: 3, clientId: 3, clientName: 'Mike Williams', planName: 'Socialization & Activities', type: 'Social', billingCode: 'S5100', status: 'Active', startDate: '2024-01-01', endDate: '2024-12-31' },
    { id: 4, clientId: 1, clientName: 'John Doe', planName: 'Medical Monitoring', type: 'Medical', billingCode: 'T1002', status: 'Inactive', startDate: '2023-01-01', endDate: '2023-12-31' },
  ];

  export const initialCarePlans: CarePlan[] = [
    { id: 1, clientId: 1, clientName: 'John Doe', planName: 'John\'s Daily Support', assignedStaffId: 2, assignedStaff: 'John Caregiver', status: 'Active', startDate: '2024-01-01', endDate: '2024-06-30', goals: 'Improve mobility and social interaction.' },
    { id: 2, clientId: 2, clientName: 'Sarah Johnson', planName: 'Sarah\'s Nursing Care', assignedStaffId: 3, assignedStaff: 'Lisa Nurse', status: 'Active', startDate: '2024-01-01', endDate: '2024-12-31', goals: 'Manage medication and monitor vital signs.' },
    { id: 3, clientId: 3, clientName: 'Mike Williams', planName: 'Mike\'s Community Engagement', assignedStaffId: 2, assignedStaff: 'John Caregiver', status: 'On-Hold', startDate: '2024-03-01', endDate: '2024-09-01', goals: 'Attend community events twice a week.' },
  ];
  
  export const initialAuthorizations: Authorization[] = [
    { id: 1, clientId: 1, clientName: 'John Doe', servicePlanId: 1, servicePlan: 'Standard Day Care', serviceType: 'Personal Care', billingCode: 'T2021', authorizedHours: 120, usedHours: 45.5, startDate: '2024-01-01', endDate: '2024-06-30', status: 'Active' },
    { id: 2, clientId: 2, clientName: 'Sarah Johnson', servicePlanId: 2, servicePlan: 'Enhanced Personal Support', serviceType: 'Personal Care', billingCode: 'T1019', authorizedHours: 80, usedHours: 70, startDate: '2024-01-01', endDate: '2024-03-31', status: 'Expired' },
    { id: 3, clientId: 3, clientName: 'Mike Williams', servicePlanId: 3, servicePlan: 'Socialization & Activities', serviceType: 'Social', billingCode: 'S5100', authorizedHours: 50, usedHours: 15, startDate: '2024-02-01', endDate: '2024-07-31', status: 'Active' },
  ];
    

    
