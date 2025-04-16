import { NextFunction, Response } from 'express';
import { ApiExtensionContext } from '@directus/types';
import { ActionChange, ChangeDeliverables, ChangeRequest, FSERT06Update, } from './types';
import { getErrorMessage } from './error';

export default async (req: ChangeRequest, res: Response, _next: NextFunction, ApiExtension: ApiExtensionContext) => {
  const { services: { ItemsService, FilesService }, database } = ApiExtension;
  const { body: { payload, action }, schema, accountability } = req;
  const transaction = await database.transaction();
  const fsert06Service = new ItemsService("rep_fsert06", { schema, accountability, transaction });
  const fsert06DeliverablesService = new ItemsService("rep_fsert06_deliverables", { schema, accountability, transaction });
  const fileReport06Service = new ItemsService("rep_fsert06_files", { schema, accountability, transaction });
  const pdfReport06Service = new ItemsService("rep_fsert06_pdfs", { schema, accountability, transaction });
  const changeService = new ItemsService("changes", { schema, accountability, transaction });
  const fileService = new FilesService({ knex: database, schema, accountability, transaction });
  let response;

  try {
    if (action === ActionChange.CREATE) {
      response = await fsert06Service.createOne(payload);
    } else if (action === ActionChange.UPDATE) {
      const payload2 = { ...payload } as unknown as FSERT06Update
      const id = payload2.id;
      delete payload2.id;

      if ('deliverables' in payload2) {
        const deliverables = payload2.deliverables as ChangeDeliverables[];
        delete payload2.deliverables;

        await Promise.all(deliverables.map(deliverable => {
          if (deliverable.action === ActionChange.CREATE) return fsert06DeliverablesService.createOne({ ...deliverable?.payload, fsert06Id: id });
          else if (deliverable.action === ActionChange.DELETE) return fsert06DeliverablesService.deleteOne(deliverable?.payload?.id);
          else throw new Error('Acción no permitida en deliverables.');
        }));
      }

      if ('files' in payload2) {
        await fileReport06Service.createMany(payload2.files?.map(file => ({ ...file, rep_fsert06_id: id })));
        delete payload2.files
      }

      if ('pdfs' in payload2) {
        await pdfReport06Service.createMany(payload2.pdfs?.map(file => ({ ...file, rep_fsert06_id: id })));
        delete payload2.pdfs
      }

      if ('deleteFiles' in payload2) {
        await fileService.deleteByQuery({ filter: { filename_download: { _in: payload2.deleteFiles } } });
        delete payload2.deleteFiles
      }

      if (Object.keys(payload2).length) {
        response = await fsert06Service.updateOne(id, payload2);
      }
    } else if (action === ActionChange.DELETE) {
      response = await fsert06Service.deleteOne(payload.id);
    } else {
      throw new Error('acción no permitida.');
    }

    await changeService.createOne(req.body);
    await transaction.commit();
    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    await transaction.rollback();
    return res.status(500).send(getErrorMessage(error));
  }
}