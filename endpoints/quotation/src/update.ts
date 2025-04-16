import { SettingQuotation, TAppRequiest, TQuotation } from './type';
import { calculate, generatePFD, getErrorMessage } from './functions';
import { QuotationHelper } from './quotationHelper';
import { validateRequest } from './validations';

export const updateQuotation = async ({ ApiExtension, req, res }: TAppRequiest) => {
  const {
    services: { ItemsService, FilesService, UsersService },
    database,
    env: { QUOTATION_FOLDER_SAVE },
  } = ApiExtension;
  const {
    schema,
    accountability,
    body,
    params: { id },
  } = req;

  const transaction = await database.transaction();

  try {
    const userService = new UsersService({ schema, accountability, transaction });

    const businessPartnerService = new ItemsService('sys_business_partner', {
      schema,
      accountability,
      transaction,
    });

    const quotationsService = new ItemsService('sales_quotations', {
      schema,
      accountability,
      transaction,
    });

    const taxService = new ItemsService('sys_tax', {
      schema,
      accountability,
      transaction,
    });

    const quotationItemsService = new ItemsService('sales_quotation_items', {
      schema,
      accountability,
      transaction,
    });

    const productService = new ItemsService('prod_products', {
      schema,
      accountability,
      transaction,
    });

    const settingService = new ItemsService('sett_quotation', {
      schema,
      accountability,
      transaction,
    });

    const quotation = await quotationsService.readOne(id);

    if (!quotation) throw new Error('Cotizacion no existe');

    const quotationServices = new QuotationHelper(userService, database, schema, accountability, productService, taxService, businessPartnerService);
    const taxs = await quotationServices.getTaxs();
    const { header, items } = await validateRequest(body, quotationServices, taxs);
    const setting: SettingQuotation = await settingService.readSingleton({ fields: ['*', 'default_emails.* '] });

    await quotationItemsService.deleteByQuery({ filter: { quotationId: { _eq: id } } });
    await Promise.all([
      quotationsService.updateOne(id, {
        ...header,
        ...(setting.no_with_sap ? { status: 'O' } : {}),
      }),
      items.length && quotationItemsService.createMany(items.map((item: any) => ({ ...item, quotationId: id }))),
    ]);

    if (setting.allow_create_pdf_with_sapId || setting.no_with_sap) {
      const fileService = new FilesService({
        schema,
        accountability,
      });

      const ids = await quotationsService.readByQuery({ fields: ['id'], limit: -1, sort: ['-id'] });

      const quotationData: TQuotation = await quotationsService.readOne(id, { fields: ['*.*'] });

      const { itbms, subTotal, total } = await calculate(quotationData);

      let dataToPdf = {
        ...quotationData,
        itbms: itbms.toNumber(),
        subTotal: subTotal.toNumber(),
        total: total.toNumber(),
        items: quotationData.items,
      };

      //@ts-ignore
      const stream = await generatePFD({ files: setting, data: dataToPdf });

      const name = ids[0].id;
      const pdfData = await fileService.uploadOne(stream, {
        title: name,
        filename_disk: `${name}.pdf`,
        filename_download: `${name}.pdf`,
        type: 'application/pdf',
        storage: 'local',
        folder: QUOTATION_FOLDER_SAVE,
      });

      await quotationsService.updateOne(quotationData.id, { pdf: pdfData, create: true });

      return { pdf: pdfData };
    }

    return { id: quotation.id };
  } catch (error) {
    await transaction.rollback();
    return res.status(500).send(getErrorMessage(error));
  }
};
