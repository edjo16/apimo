import { NextFunction, Response } from 'express';
import { ApiExtensionContext } from '@directus/types';
import { ActionChange, ChangeCondition, ChangeControl, ChangeDevelopment, ChangeOvertime, ChangeRequest, FSERT08Update, } from './types';
import { getErrorMessage } from './error';

export default async (req: ChangeRequest, res: Response, _next: NextFunction, ApiExtension: ApiExtensionContext) => {
  const { services: { ItemsService, FilesService }, database } = ApiExtension;
  const { body: { payload, action }, schema, accountability } = req;
  const transaction = await database.transaction();
  const fsert08Service = new ItemsService("rep_fsert08", { schema, accountability, transaction });
  const controlService = new ItemsService("rep_fsert08_control_milestone", { schema, accountability, transaction });
  const conditionService = new ItemsService("rep_fsert08_general_condition", { schema, accountability, transaction });
  const fileReportService = new ItemsService("rep_fsert08_files", { schema, accountability, transaction });
  const pdfReportService = new ItemsService("rep_fsert08_pdfs", { schema, accountability, transaction });
  const changeService = new ItemsService("changes", { schema, accountability, transaction });
  const fileService = new FilesService({ knex: database, schema, accountability, transaction });
  let response;

  try {
    if (action === ActionChange.CREATE) {
      response = await fsert08Service.createOne(payload);
    } else if (action === ActionChange.UPDATE) {
      const payload2 = { ...payload } as unknown as FSERT08Update
      const id = payload2.id;
      delete payload2.id;

      if ('controls' in payload2) {
        const controls = payload2.controls as ChangeControl[];
        delete payload2.controls;

        await Promise.all(controls.map(control => {
          if (control.action === ActionChange.CREATE) return controlService.createOne({ ...control?.payload, fsert08Id: id });
          else if (control.action === ActionChange.DELETE) return controlService.deleteOne(control?.payload?.id);
          else throw new Error('Acción no permitida en controls.');
        }));
      }

      if ('conditions' in payload2) {
        const conditions = payload2.conditions as ChangeCondition[];
        delete payload2.conditions;

        await Promise.all(conditions.map(condition => {
          if (condition.action === ActionChange.CREATE) return conditionService.createOne({ ...condition?.payload, fsert08Id: id });
          else if (condition.action === ActionChange.DELETE) return conditionService.deleteOne(condition?.payload?.id);
          else throw new Error('Acción no permitida en conditions.');
        }));
      }

      if ('files' in payload2) {
        await fileReportService.createMany(payload2.files?.map(file => ({ ...file, rep_fsert08_id: id })));
        delete payload2.files
      }

      if ('pdfs' in payload2) {
        await pdfReportService.createMany(payload2.pdfs?.map(file => ({ ...file, rep_fsert08_id: id })));
        delete payload2.pdfs
      }

      if ('deleteFiles' in payload2) {
        await fileService.deleteByQuery({ filter: { filename_download: { _in: payload2.deleteFiles } } });
        delete payload2.deleteFiles
      }

      if (Object.keys(payload2).length) {
        response = await fsert08Service.updateOne(id, payload2);
      }
    } else if (action === ActionChange.DELETE) {
      response = await fsert08Service.deleteOne(payload.id);
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