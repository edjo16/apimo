export enum TypeChange {
  FSERT05 = 'rep_fsert05',
  FSERT06 = 'rep_fsert06',
  FSERT08 = 'rep_fsert08'

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

export enum Control {
  VF = 'VF',
  RF = 'RF',
}

export enum ControlDeliverable {
  VALIDATION = 'V',
  ENTREGA = 'E',
  MODIFY = 'M',
}

export type ChangeRequest = Request & {
  body: ChangeBody;
  schema: any;
  accountability: any;
}

export type ChangeBody = {
  type: TypeChange;
  action: ActionChange;
  payload: FSERT05;
  id: string;
};

export type ChangeDevelopment = {
  action: ActionChange;
  payload: Development;
};

export type ChangeOvertime = {
  action: ActionChange;
  payload: Overtime;
};

export type ChangeControl = {
  action: ActionChange;
  payload: ReportControl;
};

export type ChangeCondition = {
  action: ActionChange;
  payload: ReportCondition;
};

export type ChangeDeliverables = {
  action: ActionChange;
  payload: Deliverable;
};

export type Deliverable = {
  id: string;
  control: ControlDeliverable;
  compliance: boolean;
  description: string;
  observations: string;
};

export type Development = {
  id: string;
  control: Control;
  execute: string;
  progress: number;
  description: string;
  observations: string;
};


export type Overtime = {
  id: string,
  endHour: string,
  profile: string
}

export type FSERT05Update = Partial<Omit<FSERT05, 'developments' | 'overtimes'>> & {
  developments?: ChangeDevelopment[];
  overtimes?: ChangeOvertime[];
}

export type FSERT06Update = Partial<Omit<FSERT05, 'deliverables'>> & {
  deliverables?: ChangeDeliverables[];
}

export type FSERT08Update = Partial<Omit<FSERT05, 'controls' | 'conditions'>> & {
  controls?: ChangeControl[];
  conditions?: ChangeCondition[];
}

export type File = {
  directus_files_id: string,
};

export type FSERT05 = {
  id: string,
  status: Status,
  numberOrder: number,
  version: number,
  companyName: string,
  contactEmail: string,
  contactPersonName: string,
  startingWorkHour: string,
  comments: string,
  pdf: string,
  isOvertime: false,
  clientSignature: string,
  workerSignatury: string,
  workerSignature: string,
  clientSignatury: string,
  createdAtt: string,
  workInCharge: string,
  createdUser: string,
  developments: Development[]
  overtimes: Overtime[],
  files: File[],
  pdfs: File[],
  deleteFiles: string[]
};

export type FSERT06 = {
  id: string,
  status: Status,
  numberOrder: number,
  version: number,
  companyName: string,
  contactEmail: string,
  contactPersonName: string,
  comments: string,
  clientSignature: string,
  workerSignatury: string,
  workerSignature: string,
  clientSignatury: string,
  diliverables: Deliverable[],
  workInCharge: string,
  createdUser: string,
  createdAtt: string,
  pdf: string,
  files: File[],
  pdfs: File[],
  deleteFiles?: string[]
};

export enum ReportTypeControl {
  REVISION = "Revisión",
  VERIFICACION = "Verificación",
  VALIDACION = "Validación",
  ENTREGA = "Entrega",
  MODIFICACION = "Modificación",
}

export type ReportControl = {
  id: string,
  progress: number,
  type: ReportTypeControl,
  description: string,
  observations: string,
}

export enum ReportTypeCondition {
  AVANCE = "Avance",
  ENTREGA = "Entrega",
}

export type ReportCondition = {
  id: string,
  milestone: number,
  type: ReportTypeCondition,
  explanation: string,
  deliveryDate: string,
}

export type FSERT08 = {
  id: string,
  version: number,
  status: Status,
  numberOrder: number,
  numberOrderOC: number,
  providerName: string,
  providerEmail: string,
  contactPersonName: string,
  orderedCustomer: string,
  generalInformation: string,
  salesExecutive: string,
  contactPersonEmail: string,
  contactPersonPhone: string,
  comments: string,
  clientSignature: string,
  workerSignatury: string,
  workerSignature: string,
  clientSignatury: string,
  createdAtt: string,
  workInCharge: string,
  createdUser: string,
  pdf: string,
  controls: ReportControl[],
  conditions: ReportCondition[],
  files: File[],
  pdfs: File[],
  deleteFiles?: string[]
};

export type RawBody = {
  salesIds: string[];
  contactIds: string[];
  partnerIds: string[];
  itemsIds: string[];
}