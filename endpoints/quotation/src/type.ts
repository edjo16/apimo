import { QuotationHelper } from './quotationHelper';

export type TAppRequiest = {
  req: any;
  res: any;
  ApiExtension: any;
};

export type TDataHeaderQuotation = {
  code: string;
  client: string;
  contact: string;
  dateCreation: Date;
  expirationDate: Date;
  comment: string;
  discouter: number;
  salesEmployee: string;
  owner: string;
};

export type TQuotationDataForm = {
  header: TDataHeaderQuotation;
  items: TQuotationDataItemsForm[];
};
export type TQuotationDataItemsForm = {
  sku: string;
  description: string;
  code: string;
  price: number;
  qty: number;
  tax: string;
  type: TypeLine;
};

export type TQuotation = {
  id: number;
  sapId: string;
  businessPartnerId: number;
  status: string;
  description: string;
  codeClient: string;
  nameClient: string;
  comment: string;
  contactClient: string;
  expirationDate: Date;
  dateCreated:Date;
  discouter: number;
  date_created: Date;
  user_created: any;
  salesEmployee: string;
  contactphone: string;
  contactEmail: string;
  owner: string;
  items: TQuotationItem[];
  pdf: string;
};

export type TQuotationItem = {
  committed?: string;
  description?: string;
  code?: string;
  price?: number;
  qty?: number;
  stock?: string;
  tax?: number;
  total?: number;
  type?: TypeLine;
  productId: number;
  taxCode?: string;
};

export enum TypeLine {
  PRODUCT = 'Producto',
  LINE = 'Linea',
}

export type TItem = {
  id: number;
  type?: string;
  sku?: string;
  code?: string;
  description?: string;
  qty: number;
  price: number;
  tax: string;
  productCode: string;
  taxCode: string;
};

export type TExportPDF = {
  files: SettingQuotation;
  helper: QuotationHelper;
  data: TQuotation & {
    itbms: number;
    subTotal: number;
    total: number;
  };
};

export type SettingQuotation = {
  allow_discount: boolean;
  allow_change_list_price: boolean;
  allow_change_date_created: boolean;
  allow_change_date_expiration: boolean;
  report_header: string;
  report_footer: string;
  allow_create_pdf_with_sapId: boolean;
  no_with_sap: boolean;
  days_by_default: number;
  email_body: string;
  default_emails: {
    id: number;
    status: string;
    email: string;
  }[];
};

export type TContact = {
  id: string;
  name: string;
  position: string;
  email: string;
  phone1: string;
  phone2?: string;
  address: string;
  partnerId: string;
  sapid?: string;
};

export type TBusinessPartner = {
  code: string;
  name: string;
  ruc: string;
  dv: string;
  type: string;
  address: string;
  email: string;
  phone1: string;
  phone2: string;
  contact: string;
  status: string;
  contacts: TContact[];
};

export type TTax = {
  id: number;
  status: string;
  code: string;
  name: string;
  value: number;
};

export type TUser = {
  id: string;
  first_name: string;
  last_name: string;
};
