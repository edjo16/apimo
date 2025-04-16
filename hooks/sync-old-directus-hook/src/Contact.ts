import { compareObjects } from './functions';
import { ActionChange, ChangeBody } from './types';

export default async (change: ChangeBody, ItemsService: any, schema: any, transaction: any) => {
  const { payload, action } = change;
  const contactService = new ItemsService("sys_contacts", { schema, transaction });

  if (action === ActionChange.CREATE) {
    await contactService.createOne(payload);
    return payload;
  } else if (action === ActionChange.UPDATE) {
    const contact = await contactService.readOne(payload.id);
    const body = compareObjects(payload, contact);
    if (body) {
      await contactService.updateOne(payload.id, body);
      return { ...body, id: payload.id };
    }
  } else {
    throw new Error('acción no permitida.');
  }
  return 'omit';
}