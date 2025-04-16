import { defineHook, } from '@directus/extensions-sdk';
import { SettingQuotation, TQuotation } from './Type';
import { calculate, capitalizeWords, generatePFD } from './functions';
import moment from 'moment';

export default defineHook(({ action, schedule }, { services, env, database, getSchema }) => {
  const { ItemsService, FilesService, MailService } = services;
  const { HOST_DOMAIN, QUOTATION_FOLDER_SAVE } = env;
  action('sales_quotations.items.update', async (meta, { schema, accountability, database }) => {
    const { keys, payload } = meta as {
      payload: any;
      collection: string;
      keys: string[];
    };

    const emailService = new MailService({ schema, accountability });
    const quotationsService = new ItemsService('sales_quotations', { schema, knex: database });
    const settingService = new ItemsService('sett_quotation', { schema, accountability });

    const quotationData: TQuotation = await quotationsService.readOne(keys[0], { fields: ['*.*'] });
    const setting: SettingQuotation = await settingService.readSingleton({ fields: ['*', 'default_emails.id', 'default_emails.status', 'default_emails.email'] });
    const sendMeils = setting.default_emails.filter((mail) => mail.status !== 'I').map((mail) => mail.email);
    quotationData.contactEmail && sendMeils.push(quotationData.contactEmail);

    if ('status' in payload && 'sapId' in payload) {
      const fileService = new FilesService({ schema, accountability });

      if (payload.status == 'O' && payload.sapId) {
        const taxService = new ItemsService('sys_tax', { schema, accountability });

        const { itbms, subTotal, total } = await calculate(quotationData, taxService);

        let dataToPdf = {
          ...quotationData,
          itbms: itbms.toNumber(),
          subTotal: subTotal.toNumber(),
          total: total.toNumber(),
          items: quotationData.items,
        };

        const stream = await generatePFD({ files: setting, data: dataToPdf });

        const pdfData = await fileService.uploadOne(stream, {
          title: setting.no_with_sap ? quotationData.id : quotationData.sapId,
          filename_disk: `${setting.no_with_sap ? quotationData.id : quotationData.sapId}.pdf`,
          filename_download: `${setting.no_with_sap ? quotationData.id : quotationData.sapId}.pdf`,
          type: 'application/pdf',
          storage: 'local',
          folder: QUOTATION_FOLDER_SAVE,
        });
        await quotationsService.updateOne(quotationData.id, { pdf: pdfData });
        await emailService.send({
          to: sendMeils,
          subject: 'Propuesta Comercial ICAutomatizados',
          template: {
            name: 'ica-quotation-email',
            data: {
              contact: capitalizeWords(quotationData.contactClient.toLocaleLowerCase()),
            },
          },
          attachments: [
            {
              filename: `Cotización-${setting.no_with_sap ? quotationData.id : quotationData.sapId}.pdf`,
              path: `${HOST_DOMAIN}/assets/${pdfData}`,
            },
          ],
        });
      }
    }

    if ('create' in payload && 'pdf' in payload) {
      await emailService.send({
        to: sendMeils,
        subject: 'Propuesta Comercial ICAutomatizados',
        template: {
          name: 'ica-quotation-email',
          data: {
            contact: capitalizeWords(quotationData.contactClient.toLocaleLowerCase()),
          },
        },        attachments: [
          {
            filename: `Cotización-${setting.no_with_sap ? quotationData.id : quotationData.sapId}.pdf`,
            path: `${HOST_DOMAIN}/assets/${payload.pdf}`,
          },
        ],
      });
    }
  });

  schedule('59 23 * * *', async () => {
    const schema = await getSchema();
    const quotationsService = new ItemsService('sales_quotations', { schema, knex: database });

    const quotations: TQuotation[] = await quotationsService.readByQuery({
      fields: ['id', 'expirationDate'],
      filter: { status: { _neq: 'C' } },
      limit: -1,
    });
    if (quotations.length) {
      for (const quotation of quotations) {
        if (!moment(quotation.expirationDate).isSameOrAfter(moment(), 'second')) {
          console.log(`La Cotizacion N° ${quotation.id} fue cerrada por estar vencida`);
          await quotationsService.updateOne(quotation.id, { status: 'C' });
        }
      }
    }
  });
});

