export type SupplierStatus = true | false;

export interface SupplierRow {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  status: SupplierStatus;
  createdAt: string;
  address: string;
  category: string;
  lastOrderAt: string;
  canDelete?: boolean; // Indicates if the supplier can be deleted safely
}

export interface SupplierFormValues {
  name: string;
  contact: string;
  email: string;
  phone: string;
  status: SupplierStatus;
}
