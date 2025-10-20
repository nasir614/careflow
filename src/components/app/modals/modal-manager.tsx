'use client';

import { useCareFlow } from '@/contexts/CareFlowContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ClientForm from './client-form';
import DeleteModal from './delete-modal';
import { Schedule, Client, AnyData } from '@/lib/types';
import ScheduleForm from './schedule-form';
import GenericForm from './generic-form';
import GenericViewModal from './generic-view-modal';
import BulkAttendanceForm from './bulk-attendance-form';

export function ModalManager() {
  const { modalOpen, closeModal, modalType, activeModule, selectedItem, handleCRUD, isLoading } = useCareFlow();

  if (!modalOpen || !activeModule) {
    return null;
  }

  const getSingularModuleName = (module: string) => {
    if (module === 'staffCredentials') return 'Staff Credential';
    if (module === 'staff') return 'Staff Member';
    if (module === 'servicePlans') return 'Service Plan';
    if (module === 'carePlans') return 'Care Plan';
    if (module === 'authorizations') return 'Authorization';
    if (module === 'attendance') return 'Attendance';
    if (module.endsWith('s')) return module.slice(0, -1);
    return module;
  }

  const singularModule = getSingularModuleName(activeModule);
  const capitalizedModule = singularModule.charAt(0).toUpperCase() + singularModule.slice(1);

  const getTitle = () => {
    if ((selectedItem as AnyData & { bulk?: boolean })?.bulk) return 'Bulk Add/Update Attendance';
    switch(modalType) {
        case 'add': return `Add New ${capitalizedModule}`;
        case 'edit': return `Edit ${capitalizedModule}`;
        case 'view': return `View ${capitalizedModule} Details`;
        case 'delete': return `Delete ${capitalizedModule}`;
        default: return '';
    }
  }

  const renderContent = () => {
    if ((selectedItem as AnyData & { bulk?: boolean })?.bulk && activeModule === 'attendance') {
      return <BulkAttendanceForm onSubmit={(data) => handleCRUD('add', 'attendance', data, selectedItem)} isLoading={isLoading} onCancel={closeModal} />;
    }

    switch (modalType) {
      case 'delete':
        return <DeleteModal onConfirm={() => handleCRUD('delete', activeModule, {}, selectedItem)} isLoading={isLoading} onCancel={closeModal} />;
      case 'view':
        if (selectedItem) {
           return <GenericViewModal item={selectedItem} module={activeModule} />;
        }
        return null;
      case 'add':
      case 'edit':
        if (activeModule === 'clients') {
          return <ClientForm item={selectedItem as Client | null} onSubmit={(data) => handleCRUD(modalType, activeModule, data, selectedItem)} isLoading={isLoading} onCancel={closeModal} />;
        }
        if (activeModule === 'schedules') {
          return <ScheduleForm item={selectedItem as Schedule | null} onSubmit={(data) => handleCRUD(modalType, activeModule, data, selectedItem)} isLoading={isLoading} onCancel={closeModal} />;
        }
        return <GenericForm module={activeModule} item={selectedItem} onSubmit={(data) => handleCRUD(modalType, activeModule, data, selectedItem)} isLoading={isLoading} onCancel={closeModal} />;
      default:
        return null;
    }
  };
  
  const isLargeModal = (modalType === 'view' && activeModule === 'clients') || 
    (['add', 'edit'].includes(modalType) && ['clients', 'schedules', 'staffCredentials', 'servicePlans', 'carePlans', 'authorizations', 'attendance'].includes(activeModule)) ||
    (selectedItem as AnyData & { bulk?: boolean })?.bulk;

  return (
    <Dialog open={modalOpen} onOpenChange={closeModal}>
      <DialogContent className={isLargeModal ? "max-w-4xl" : "max-w-2xl"}>
        <DialogHeader>
          <DialogTitle className="font-headline">{getTitle()}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[75vh] overflow-y-auto p-1 pr-4">
         {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
