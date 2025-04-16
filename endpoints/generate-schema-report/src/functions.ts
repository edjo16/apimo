import { ValidationsType } from "./types";

export const getNameTableRelation = async (
  relationService: any,
  collection: string,
  field: string
): Promise<string | null> => {
  const relation: any[] = await relationService.readByQuery({
    fields: ["one_collection"],
    filter: {
      _and: [
        {
          many_collection: { _eq: collection },
        },
        {
          many_field: { _eq: field },
        },
      ],
    },
    limit: 1,
  });
  return relation.length ? relation[0].one_collection : null;
};

export const getNameTable = async (
  relationService: any,
  collection: string,
  field: string
): Promise<string | null> => {
  const relation: any[] = await relationService.readByQuery({
    fields: ["many_collection"],
    filter: {
      _and: [
        {
          one_collection: { _eq: collection },
        },
        {
          one_field: { _eq: field },
        },
      ],
    },
    limit: 1,
  });
  return relation.length ? relation[0].many_collection : null;
};

export const getFinalTableName = async (
  relationService: any,
  collection: string,
  field: any
) => {
  if (field?.meta?.interface === "select-dropdown-m2o") {
    return await getNameTableRelation(relationService, collection, field.field);
  } else if (field?.meta?.interface === "input-autocomplete-api") {
    return field?.meta?.options?.url;
  }
};

type getSchemaProps = {
  collectionService: any;
  feildsService: any;
  relationsService: any;
  schemasHeaderService: any;
  filter: any;
  isChindren: boolean;
};

export const getSchema = async ({
  collectionService,
  feildsService,
  relationsService,
  filter,
  isChindren,
  schemasHeaderService,
}: getSchemaProps) => {
  const collections: { collection: string }[] =
    await collectionService.readByQuery({
      fields: ["collection", "nameReport", "title", "header", "footer"],
      filter,
    });

  const reports: any[] = [];
  for (let collection of collections) {
    const directusFields: any[] = await feildsService.readAll(
      collection.collection
    );
    const data = await Promise.all(
      directusFields.map(async (f) => {
        let table = await getFinalTableName(
          relationsService,
          collection.collection,
          f
        );
        let options = getOptions(f);

        const conditions = f?.meta?.conditions;
        const validations = generateValidations(f);

        let fields = null;
        let o2mCollection = null;
        if (f?.meta?.interface === "list-o2m") {
          o2mCollection = await getNameTable(
            relationsService,
            collection.collection,
            f?.field
          );

          const subShema = o2mCollection
            ? await getSchema({
              collectionService,
              feildsService,
              isChindren: true,
              relationsService,
              filter: { collection: { _eq: o2mCollection } },
              schemasHeaderService,
            })
            : null;

          fields = subShema ? subShema[0].fields : [];
        }

        const schema = {
          key: f?.field,
          interface: nameField(f),
          width: f?.meta?.width,
          sort: f?.meta?.sort,
          hidden: f?.meta?.hidden,
          table,
          options: options,
          labelText: f?.meta?.note ?? f?.field,
          dataType: f?.type,
          required: f?.meta?.required,
          defaultValue: f?.meta?.default_value,
          placeholder: f?.meta?.options?.placeholder,
          maxLines: f?.meta.interface == "input-multiline" ? 3 : null,
          maxLength: f?.schema?.max_length,
          ...(o2mCollection ? { o2mCollection } : {}),
          ...(fields ? { fields: fields } : {}),
          ...(conditions ? { conditions: conditions } : {}),
          ...(validations.length ? { validations: validations } : {}),
          ...getMaxAndMin(f),
        };
        return schema;
      })
    );

    let header = {};

    header = { ...collection };
    reports.push({
      collection: collection.collection,
      fields: data.sort((a, b) => a.sort - b.sort),
      ...header,
    });
  }
  return reports;
};

export const nameField = (field: any) => {
  if (field?.meta?.interface === "input-autocomplete-api") {
    return "select-dropdown-m2o";
  } else if (field?.meta?.interface === "input-multiline") {
    return "input";
  } else {
    return field?.meta?.interface;
  }
};

export const getOptions = (field: any) => {
  if (
    ["select-dropdown", "select-multiple-checkbox"].includes(
      field?.meta?.interface
    )
  ) {
    return field?.meta?.options?.choices?.map((c: any) => ({ ...c }));
  }

  return null;
};

export const generateValidations = (field: any) => {
  let validations: String[] = [];

  if (field?.meta?.required && field?.meta?.required) {
    validations.push(ValidationsType.REQUIRED);
  }

  if (field?.schema?.data_type == "integer") {
    console.log(field.field);
    validations.push(ValidationsType.NUMBER);
  }

  if (field?.meta?.interface == "slider") {
    if (field?.meta?.options) {
      if (field?.meta?.options?.minValue) {
        validations.push(ValidationsType.MIN);
      }
      if (field?.meta?.options?.maxValue) {
        validations.push(ValidationsType.MAX);
      }
    }
  }

  if (field?.schema?.max_length) {
    validations.push(ValidationsType.MAX_LENGTH);
  }

  return validations;
};

export const getMaxAndMin = (field: any) => {
  let maxAndMin = {
    min: null,
    max: null,
  };

  if (field?.meta?.interface == "slider") {
    if (field?.meta?.options) {
      maxAndMin["min"] = field?.meta?.options?.minValue
        ? field?.meta?.options?.minValue
        : null;
      maxAndMin["max"] = field?.meta?.options?.maxValue
        ? field?.meta?.options?.maxValue
        : null;
    }
  }

  return {
    ...(maxAndMin.min ? { min: maxAndMin.min } : {}),
    ...(maxAndMin.max ? { max: maxAndMin.max } : {}),
  };
};
