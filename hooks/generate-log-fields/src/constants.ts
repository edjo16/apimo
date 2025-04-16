export const COMPANY_NAME = {
  field: "companyName",
  type: "string",
  meta: {
    icon: "title",
    name: "companyName",
    schema: "public",
    data_type: "character varying",
    note: 'Nombre De La Compañía',
    interface: "input",

  },
};

export const NUMBER_ORDER = {
  field: "numberOrder",
  type: "string",
  meta: {
    icon: "title",
    name: "numberOrder",
    schema: "public",
    data_type: "character varying",
    note: 'Número de Orden',
    interface: "input",

  },
};

export const COMPANY_CODE = {
  field: "companyCode",
  type: "string",
  meta: {
    icon: "title",
    name: "companyCode",
    schema: "public",
    data_type: "character varying",
    note: 'Código de Compañía',
    interface: "input",
  },
};

export const VERSION = {
  field: "version",
  type: "float",
  meta: {
    icon: "title",
    name: "version",
    schema: "public",
    data_type: "real",
    hidden: true,
    interface: "input",
  },
};

export const DATE_CREATED = {
  field: "dateCreated",
  type: "timestamp",
  meta: {
    icon: "title",
    name: "dateCreated",
    schema: "public",
    width: "half",
    data_type: "timestamp with time zone",
    hidden: true,
    interface: "datetime",
  },
};

export const USER_CREATED_FIELD = {
  field: "userCreated",
  type: "uuid",
  schema: {},
  meta: {
    width: "half",
    interface: "select-dropdown-m2o",
    special: ["m2o"],
    required: true,
    hidden: true,
    options: {
      template: "{{first_name}}{{last_name}}"
    },
  },
};

export const DATE_UPDATED = {
  field: "dateUpdated",
  type: "timestamp",
  meta: {
    icon: "title",
    name: "dateUpdated",
    schema: "public",
    width: "half",
    data_type: "timestamp with time zone",
    hidden: true,
    interface: "datetime",
  },
};

export const USER_UPDATE_FIELD = {
  field: "userUpdate",
  type: "uuid",
  schema: {},
  meta: {
    hidden: true,
    width: "half",
    interface: "select-dropdown-m2o",
    special: ["m2o"],
    options: {
      template: "{{first_name}}{{last_name}}"
    },
  },
};

export const ALL_FIELDS = [
  COMPANY_CODE.field,
  NUMBER_ORDER.field,
  COMPANY_NAME.field,
  VERSION.field,
  USER_CREATED_FIELD.field,
  DATE_CREATED.field,
  USER_UPDATE_FIELD.field,
  DATE_UPDATED.field
]