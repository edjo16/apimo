import { compareObjects } from './functions';
import { ActionChange, ChangeBody } from './types';

export default async (change: ChangeBody, ItemsService: any, schema: any, transaction: any) => {
  const { payload, action } = change;
  const partnerService = new ItemsService("sys_business_partner", { schema, transaction });

  if (action === ActionChange.CREATE) {
    await partnerService.createOne(payload);
    return payload;
  } else if (action === ActionChange.UPDATE) {
    const partner = await partnerService.readOne(payload.code);
    const body = compareObjects(payload, partner);
    if (body) {
      await partnerService.updateOne(payload.code, body);
      return { ...body, code: payload.code };
    }
  } else {
    throw new Error('acción no permitida.');
  }
  return 'omit';
}