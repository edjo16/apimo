import { compareObjects } from './functions';
import { ActionChange, ChangeBody, accountability } from './types';

export default async (change: ChangeBody, ItemsService: any, schema: any, transaction: any) => {
  const { payload, action } = change;
  const saleItemService = new ItemsService("sales_items", { schema, accountability, transaction });
  console.log(action);

  if (action === ActionChange.CREATE) {
    await saleItemService.createOne(payload);
    return payload;
  } else if (action === ActionChange.UPDATE) {
    console.log(payload.sapid);
    const item = await saleItemService.readOne(payload.sapid);
    console.log('item');

    const body = compareObjects(payload, item);
    if (body) {
      await saleItemService.updateOne(payload.sapid, body)
      return { ...body, orderId: payload.orderId };
    }
  } else {
    throw new Error('acción no permitida.');
  }
  return 'omit';
}