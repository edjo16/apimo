import { compareObjects } from './functions';
import { ActionChange, ChangeBody, accountability } from './types';

export default async (change: ChangeBody, ItemsService: any, schema: any, transaction: any) => {
  const { payload, action } = change;


  const saleOrderService = new ItemsService("sales_orders", { schema, accountability, transaction });

  if (action === ActionChange.CREATE) {
    await saleOrderService.createOne(payload);
    return payload;
  } else if (action === ActionChange.UPDATE) {
    const order = await saleOrderService.readOne(payload.number);

    const body = compareObjects(payload, order);
    if (body) {
      await saleOrderService.updateOne(payload.number, body);
      return { ...body, number: payload.number };
    }
  } else {
    throw new Error('acción no permitida.');
  }
  return 'omit';
}