import { Router } from 'express';
import { createQuotation } from './create';
import { updateQuotation } from './update';
import { SettingQuotation, TQuotation } from './type';
import { defineEndpoint } from '@directus/extensions-sdk';
import { capitalizeWords, getErrorMessage } from './functions';
import { string, array } from 'yup';

export default defineEndpoint((router: Router, ApiExtension: any) => {
  router.post('/', async (req: any, res: any, _next: any) => {
    await createQuotation({ res, req, ApiExtension })
      .then((e) => res.status(200).json({ respon: e }))
      .catch((error) => res.status(500).send(getErrorMessage(error)));
  });

  router.patch('/:id', async (req: any, res: any, _next: any) => {
    await updateQuotation({ res, req, ApiExtension })
      .then((e) => res.status(200).json({ respon: e }))
      .catch((error) => res.status(500).send(getErrorMessage(error)));
  });

  router.post('/send-mail/:id', async (req: any, res, _next) => {
    const {
      services: { MailService, ItemsService },
      env: { HOST_DOMAIN },
    } = ApiExtension;
    const {
      schema,
      accountability,
      params: { id },
      body,
    } = req;
    const emailService = new MailService({ schema, accountability });

    const settingService = new ItemsService('sett_quotation', {
      schema,
      accountability,
    });

    const quotationsService = new ItemsService('sales_quotations', {
      schema,
      accountability,
    });

    try {
      const setting: SettingQuotation = await settingService.readSingleton({ fields: ['no_with_sap', 'default_emails.id', 'default_emails.status', 'default_emails.email'] });
      const quotation: TQuotation = await quotationsService.readOne(id).catch(console.error);

      if(!quotation) throw new Error('Cotización no encontrada');

      const schema = array(string().trim().email('Email inválido'));
      await schema.validate(body);


      await emailService.send({
        to: body,
        subject: 'Propuesta Comercial ICAutomatizados',
        template: {
          name: 'ica-quotation-email',
          data: {
            contact: capitalizeWords(quotation.contactClient.toLocaleLowerCase()),
          },
        },
        attachments: [
          {
            filename: `Cotización-${setting.no_with_sap ? quotation.id : quotation.sapId}.pdf`,
            path: `${HOST_DOMAIN}/assets/${quotation.pdf}`,
          },
        ],
      });

      res.status(200).json({ respon: body });
    } catch (error) {
      res.status(500).send(getErrorMessage(error));
    }
  });
});