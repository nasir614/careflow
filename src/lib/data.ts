import type { Client, Staff, Attendance, Compliance, Billing, Transportation, Schedule } from './types';

export const initialClients: Client[] = [
    { 
      id: 1, 
      firstName: 'John', 
      lastName: 'Doe', 
      phone: '614-222-5555', 
      email: 'john@client.com', 
      address: '123 Wellness Rd', 
      city: 'Columbus',
      state: 'OH',
      zip: '43215',
      providerName: 'Direct Care Home Health',
      caseManager: 'Sarah Jones',
      caseManagerPhone: '614-555-2233',
      caseManagerEmail: 'sjones@medicaid.gov',
      insurance: 'Medicare',
      status: 'active',
      serviceCode: 'T2021',
      createdAt: '2024-01-15'
    },
    { 
      id: 2, 
      firstName: 'Sarah', 
      lastName: 'Johnson', 
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
    { id: 1, name: 'Dr. Sarah Mitchell', role: 'Medical Director', phone: '614-111-2222', email: 'sarah.m@carecloud.com', status: 'Active', schedule: 'Mon-Fri', department: 'Medical', avatarUrl: "https://picsum.photos/seed/101/100/100" },
    { id: 2, name: 'John Caregiver', role: 'Senior Caregiver', phone: '614-222-3333', email: 'john.c@carecloud.com', status: 'Active', schedule: 'Mon-Fri', department: 'Care', avatarUrl: "https://picsum.photos/seed/102/100/100" },
    { id: 3, name: 'Lisa Nurse', role: 'Registered Nurse', phone: '614-333-4444', email: 'lisa.n@carecloud.com', status: 'Active', schedule: 'Tue-Sat', department: 'Medical', avatarUrl: "https://picsum.photos/seed/103/100/100" },
  ];

  export const initialAttendance: Attendance[] = [
    { id: 1, clientName: 'John Doe', date: '2025-10-19', checkIn: '09:00', checkOut: '15:30', status: 'Present', duration: '6h 30m', notes: 'Regular day' },
    { id: 2, clientName: 'Sarah Johnson', date: '2025-10-19', checkIn: '08:45', checkOut: '15:15', status: 'Present', duration: '6h 30m', notes: '' },
    { id: 3, clientName: 'Mike Williams', date: '2025-10-19', checkIn: '09:15', checkOut: '14:00', status: 'Early Departure', duration: '4h 45m', notes: 'Medical appt' },
  ];

  export const initialCompliance: Compliance[] = [
    { id: 1, client: 'John Doe', type: 'Authorization', item: 'Service Authorization', status: 'Expiring Soon', dueDate: '2025-10-25', daysLeft: 6 },
    { id: 2, client: 'Sarah Johnson', type: 'Document', item: 'Medical Assessment', status: 'Expired', dueDate: '2025-10-15', daysLeft: -4 },
    { id: 3, client: 'Mike Williams', type: 'Authorization', item: 'Service Authorization', status: 'Current', dueDate: '2025-12-30', daysLeft: 72 },
  ];

  export const initialBilling: Billing[] = [
    { id: 1, invoiceNo: 'INV-2025-001', client: 'John Doe', serviceDate: '2025-10-19', units: 6.5, rate: 150, amount: 975, status: 'Pending' },
    { id: 2, invoiceNo: 'INV-2025-002', client: 'Sarah Johnson', serviceDate: '2025-10-19', units: 6.5, rate: 150, amount: 975, status: 'Approved' },
    { id: 3, invoiceNo: 'INV-2025-003', client: 'Mike Williams', serviceDate: '2025-10-19', units: 4.75, rate: 150, amount: 712.5, status: 'Pending' },
  ];

  export const initialTransportation: Transportation[] = [
    { id: 1, client: 'John Doe', driver: 'Mike Driver', pickup: '08:30', dropoff: '16:00', route: 'Route A', status: 'Scheduled', date: '2025-10-20' },
    { id: 2, client: 'Sarah Johnson', driver: 'Lisa Driver', pickup: '08:15', dropoff: '15:45', route: 'Route B', status: 'In Progress', date: '2025-10-19' },
    { id: 3, client: 'Mike Williams', driver: 'Mike Driver', pickup: '09:00', dropoff: '14:30', route: 'Route A', status: 'Completed', date: '2025-10-18' },
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
  ];
