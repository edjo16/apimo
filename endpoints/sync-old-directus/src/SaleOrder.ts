import { compareObjects, isValidToChange } from './functions';
import { ActionChange, ChangeBody, accountability } from './types';

export default async (change: ChangeBody, ItemsService: any, schema: any, transaction: any) => {
  const { payload, action } = change;

  const saleOrderService = new ItemsService("sales_orders", { schema, accountability, transaction });

  if (action === ActionChange.CREATE) {
    await saleOrderService.createOne(payload);
    return payload;
  } else if (action === ActionChange.UPDATE) {
    const order = await saleOrderService.readOne(payload.number, { fields: ['*', 'items.code'] });
    const saveChange = order.items.some((item: { code: string }) => isValidToChange(item.code));
    const body = compareObjects(payload, order);
    if (body) {
      await saleOrderService.updateOne(payload.number, body);
      return saveChange ? { ...body, number: payload.number } : 'omit';
    }
  } else {
    throw new Error('acción no permitida.');
  }
  return 'omit';
}