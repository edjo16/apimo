import moment from 'moment';
import { QuotationHelper } from './quotationHelper';
import { object, string, number, date, array } from 'yup';
import { TQuotationDataForm, TQuotationDataItemsForm, TTax, TypeLine } from './type';
import Big from 'big.js';

const quotationRequestSchema = object({
  header: object({
    code: string().trim().max(15, 'El código no puede tener más de 15 caracteres.').required('El código es obligatorio.'),
    client: string().trim().max(100, 'El cliente no puede tener más de 100 caracteres.').required('El cliente es obligatorio.'),
    contact: string().trim().max(100, 'El contacto no puede tener más de 100 caracteres.').required('El contacto es obligatorio.'),
    dateCreated: date().required('La fecha de creación es obligatoria.'),
    expirationDate: date().min(moment().toDate(), 'La fecha de vencimiento no puede ser anterior a la fecha actual.').required('La fecha de vencimiento es obligatoria.'),
    comment: string().trim().max(254, 'El comentario no puede tener más de 254 caracteres.').required('El comentario es obligatorio.'),
    discouter: number().min(0, 'El descuento debe ser un número mayor o igual a cero.').required('El descuento es obligatorio.'),
    salesEmployee: string().trim().uuid().max(100, 'El empleado de ventas debe ser un UUID con un máximo de 100 caracteres.').required('El empleado de ventas es obligatorio.'),
    owner: string().trim().uuid().max(100, 'El propietario debe ser un UUID con un máximo de 100 caracteres.').required('El propietario es obligatorio.'),
  }),
  items: array().min(1, 'Debe agregar al menos un elemento a la lista de ítems.').required('La lista de ítems es obligatoria.'),
}); 

const itemTypeLine = object({
  description: string().max(254, 'La descripción no puede tener más de 254 caracteres.').required('La descripción es obligatoria.'),
  type: string().oneOf(Object.values(TypeLine), 'El tipo debe ser un valor permitido.'),
});

const itemTypeProduct = object({
  description: string().max(254, 'La descripción no puede tener más de 254 caracteres.').required('La descripción es obligatoria.'),
  code: string().max(50, 'El código no puede tener más de 50 caracteres.').required('El código es obligatorio.'),
  price: number().positive('El precio debe ser un número positivo.').required('El precio es obligatorio.'),
  qty: number().min(1, 'La cantidad debe ser al menos 1.').positive('La cantidad debe ser un número positivo.').required('La cantidad es obligatoria.'),
  tax: string().required('El impuesto es obligatorio.'),
  type: string().oneOf(Object.values(TypeLine), 'El tipo debe ser un valor permitido.'),
});

export const validateRequest = async (input: TQuotationDataForm, helper: QuotationHelper, taxs: TTax[]) => {
  const { header, items } = await quotationRequestSchema.validate(input);
  const promisesValidate = input.items.map((item) => (item.type === TypeLine.LINE ? itemTypeLine.validate(item) : itemTypeProduct.validate(item)));

  const [businessPartner, owner, salesEmployee, itemsFormat] = await Promise.all([
    helper.getbusinessPartnerByCode(header.code),
    helper.getUser(header.owner),
    helper.getUser(header.salesEmployee),
    validateItems(items, helper, taxs),
    ...promisesValidate,
  ]);

  if (businessPartner.name !== header.client && businessPartner.code !== 'C-000002') throw new Error('Solo es posible modificar el nombre para el cliente con código C-000002');
  const { itbms, total } = getTotals(items);

  let toSubtract = Big(0);

  toSubtract = total.mul(Big(header.discouter)).div(Big(100));

  let totalDocument = total.sub(toSubtract);

  return {
    header: {
      businessPartnerCode: businessPartner.code,
      nameClient: header.client,
      codeClient: header.code,
      contactClient: header.contact,
      expirationDate: header.expirationDate,
      discouter: header.discouter,
      contactphone: businessPartner.phone1 ? businessPartner.phone1 : businessPartner.phone2,
      contactEmail: businessPartner.email,
      comment: header.comment,
      salesEmployee: `${salesEmployee.first_name} ${salesEmployee.last_name}`,
      salesEmployeeRef: salesEmployee.id,
      owner: `${owner.first_name} ${owner.last_name}`,
      ownerRef: owner.id,
      dateCreated: header.dateCreated,
      totalBeforeDiscount: total.toFixed(2),
      totalTax: itbms.toFixed(2),
      documentTotal: totalDocument.toFixed(2),
    },
    items: itemsFormat,
  };
};

const validateItems = async (items: TQuotationDataItemsForm[], helper: QuotationHelper, taxs: TTax[]) => {
  for (const item of items) {
    if (item.type === TypeLine.LINE) continue;

    const product = await helper.getProductByCode(item.code);

    if (!product) throw new Error(`Codigo ${item.code} no encontrado `);

    const tax = taxs.find((tax) => tax.code === item.tax);

    if (!tax) throw new Error('ITBMS no encontrado ');

    Object.assign(item, {
      ...item,
      tax: tax.value,
      productCode: product.code,
      taxCode: tax.code,
    });
  }

  return items;
};

const getTotals = (items: TQuotationDataItemsForm[]) => {
  return items.reduce(
    (acc, current) => {
      const { qty, price, tax, type } = current;
      if (type === TypeLine.LINE) return acc;
      if (!qty || !price || !tax) return acc;

      const priceLine = Big(qty).times(Big(price));
      const taxRate = Big(tax).div(100);
      const taxAmount = priceLine.times(taxRate);

      return {
        total: acc.total.plus(priceLine.plus(taxAmount)),
        itbms: acc.itbms.plus(taxAmount),
        subTotal: acc.subTotal.plus(priceLine),
      };
    },
    { subTotal: Big(0), itbms: Big(0), total: Big(0) }
  ) as unknown as { total: Big; subTotal: Big; itbms: Big };
};
