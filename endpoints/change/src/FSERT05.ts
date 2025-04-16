import { NextFunction, Response } from 'express';
import { ApiExtensionContext } from '@directus/types';
import { ActionChange, ChangeDevelopment, ChangeOvertime, ChangeRequest, FSERT05Update, } from './types';
import { getErrorMessage } from './error';

export default async (req: ChangeRequest, res: Response, _next: NextFunction, ApiExtension: ApiExtensionContext) => {
  const { services: { ItemsService, FilesService }, database } = ApiExtension;
  const { body: { payload, action }, schema, accountability } = req;
  const transaction = await database.transaction();
  const fsert05Service = new ItemsService("rep_fsert05", { schema, accountability, transaction });
  const overtimeService = new ItemsService("rep_fsert05_overtimes", { schema, accountability, transaction });
  const develomentService = new ItemsService("rep_fsert05_developments", { schema, accountability, transaction });
  const fileReportService = new ItemsService("rep_fsert05_files", { schema, accountability, transaction });
  const pdfReportService = new ItemsService("rep_fsert05_pdfs", { schema, accountability, transaction });
  const changeService = new ItemsService("changes", { schema, accountability, transaction });
  const fileService = new FilesService({ knex: database, schema, accountability, transaction });
  let response;

  try {
    if (action === ActionChange.CREATE) {
      response = await fsert05Service.createOne(payload);
    } else if (action === ActionChange.UPDATE) {
      const payload2 = { ...payload } as unknown as FSERT05Update
      const id = payload2.id;
      delete payload2.id;

      if ('developments' in payload2) {
        const developments = payload2.developments as ChangeDevelopment[];
        delete payload2.developments;

        await Promise.all(developments.map(development => {
          if (development.action === ActionChange.CREATE) return develomentService.createOne({ ...development?.payload, fsert05Id: id });
          else if (development.action === ActionChange.DELETE) return develomentService.deleteOne(development?.payload?.id);
          else throw new Error('Acción no permitida en developments.');
        }));
      }

      if ('overtimes' in payload2) {
        const overtimes = payload2.overtimes as ChangeOvertime[];
        delete payload2.overtimes;

        await Promise.all(overtimes.map(overtime => {
          if (overtime.action === ActionChange.CREATE) return overtimeService.createOne({ ...overtime?.payload, fsert05Id: id });
          else if (overtime.action === ActionChange.DELETE) return overtimeService.deleteOne(overtime?.payload?.id);
          else throw new Error('Acción no permitida en overtimes.');
        }));
      }

      if ('files' in payload2) {
        await fileReportService.createMany(payload2.files?.map(file => ({ ...file, rep_fsert05_id: id })));
        delete payload2.files
      }

      if ('pdfs' in payload2) {
        await pdfReportService.createMany(payload2.pdfs?.map(file => ({ ...file, rep_fsert05_id: id })));
        delete payload2.pdfs
      }

      if ('deleteFiles' in payload2) {
        await fileService.deleteByQuery({ filter: { filename_download: { _in: payload2.deleteFiles } } });
        delete payload2.deleteFiles
      }

      if (Object.keys(payload2).length) {
        response = await fsert05Service.updateOne(id, payload2);
      }
    } else if (action === ActionChange.DELETE) {
      response = await fsert05Service.deleteOne(payload.id);
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