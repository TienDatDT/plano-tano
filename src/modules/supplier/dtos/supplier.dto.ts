export interface CreateSupplierDTO {
  name: string;
  representative?: string | null;
  contact?: string | null;
  address?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: boolean;
}

export interface UpdateSupplierDTO {
  name?: string;
  representative?: string | null;
  contact?: string | null;
  address?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: boolean;
}
