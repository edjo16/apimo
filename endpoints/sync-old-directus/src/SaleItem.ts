import { compareObjects, isValidToChange } from './functions';
import { ActionChange, ChangeBody, accountability } from './types';

export default async (change: ChangeBody, ItemsService: any, schema: any, transaction: any) => {
  const { payload, action } = change;
  const saleItemService = new ItemsService("sales_items", { schema, accountability, transaction });

  if (action === ActionChange.CREATE) {
    await saleItemService.createOne(payload);
    return isValidToChange(payload.code) ? payload : 'omit';

  } else if (action === ActionChange.UPDATE) {
    const item = await saleItemService.readOne(payload.sapid);
    const body = compareObjects(payload, item);

    if (body) {
      await saleItemService.updateOne(payload.sapid, body)
      return isValidToChange(item.code) ? { ...body, orderId: payload.orderId } : 'omit';
    }
  } else {
    throw new Error('acción no permitida.');
  }
  return 'omit';
}