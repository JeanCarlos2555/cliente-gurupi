export interface Company {
  name: string;
  logo?: string;
  phone?: { number?: string };
  address?: {
    zip_code?: string;
    street?: string;
    number?: string;
    neighborhood?: string;
    state?: string;
    city?: string;
    complement?: string;
  };
}

export interface Customer {
  name: string;
  cpf_cnpj: string;
  company?: Company | null;
}

export interface Perfil {
  name: string | null;
  email: string | null;
  cpf_cnpj: string | null;
}

export type FaturaStatus = "pago" | "vencido" | "a_vencer";

export interface Fatura {
  id: number;
  value: string;
  value_paid: string | null;
  due_date: string;
  date_payment: string | null;
  description: string;
  status: FaturaStatus;
  link: string | null;
  barcode: string | null;
  pix_copia_cola: string | null;
  pix_qr_code_img: string | null;
}

export interface FaturasResponse {
  faturas: Fatura[];
  paginacao: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface LoginResponse {
  otp_required: boolean;
  challenge_id?: string;
  email?: string;
  expires_at?: number;
  token?: string;
  customer?: Customer;
}

export interface ConsumoMes {
  periodo: string; // "03/26"
  download: number; // bytes
  upload: number; // bytes
}

export interface ConsumoResponse {
  meses: ConsumoMes[];
}
