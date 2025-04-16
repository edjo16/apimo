export type MetaCreate = {
  payload: {
    numberOrder: string;
    userUpdated?: string;
    userCreated?: string;
    pdf: string;
    version: number;
  };
  collection: string;
  event: string;
};


export type MetaUpdate = {
  payload: {
    userUpdated?: string;
    userCreated?: string;
    pdf: string;
    version: number;
  };
  keys: string[];
};


export type Report = {
  id: string;
  companyName: string;
  companyCode: string;
  numberOrder: number;
  version: number;
};

export type Collection = {
  collection: string;
  nameReport: string;
  title: string;
  header: string;
  footer: string;
  group: string;
}

export type Company = {
  id: string;
  emails: { email: string }[]
  companyLogo: string;
}

export type EmailTemplate = {
  payload: {
    companyName: string;
    numberOrder: string;
    version: string;
  },
  isUpdate: boolean,
  nameReport: string
  header?: string
  logo?: string
}