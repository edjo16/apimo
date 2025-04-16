import { Accountability } from "@directus/types";

export enum TypeChange {
  BUSINESS_PARTNER = 'businessPartnerBox',
  CONTACT = 'businessPartnerContactBox',
  USER = 'userBox',
  SALE_ORDER = 'saleOrderBox',
  SALE_ITEM = 'saleOrderItemBox'
}

export enum ActionChange {
  CREATE = 'C',
  UPDATE = 'U',
  DELETE = 'D'
}

export enum Status {
  ACTIVE = 'A',
  INACTIVE = 'I',
}

export enum StatusOpen {
  OPEN = 'O',
  CLOSED = 'C',
}

export type ChangeRequest = Request & {
  body: ChangeBody;
  schema: any;
  accountability: any;
}

export type ChangeBody = {
  id: number;
  type: TypeChange;
  action: ActionChange;
  payload: any;
};

export enum Canceled {
  YES = 'Y',
  NO = 'N',
}

export type SaleOrder = {
  number: string,
  status: StatusOpen,
  docEntry: number,
  canceled: Canceled,
  date: string,
  dateExpiration: string,
  partnerId: string,
  docTotal: number,
  comments: string,
};

export const accountability: Accountability = {
  user: '53131ca7-5ceb-4ac3-bba8-1fb67c5a8977',
  role: '293f17bd-e59f-4cc5-8ff0-86371eab3854',
  admin: true,
};