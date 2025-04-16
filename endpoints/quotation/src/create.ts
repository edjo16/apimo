import { validateRequest } from './validations';
import { QuotationHelper } from './quotationHelper';
import { SettingQuotation, TAppRequiest, TQuotation } from './type';
import { calculate, generatePFD, getErrorMessage } from './functions';

export const createQuotation = async ({ ApiExtension, req, res }: TAppRequiest) => {
  const {
    services: { ItemsService, FilesService, UsersService },
    database,
    env,
  } = ApiExtension;

  const { schema, accountability, body } = req;

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

    const productService = new ItemsService('prod_products', {
      schema,
      accountability,
      transaction,
    });

    const taxService = new ItemsService('sys_tax', {
      schema,
      accountability,
      transaction,
    });

    const settingService = new ItemsService('sett_quotation', {
      schema,
      accountability,
      transaction,
    });

    const quotationServices = new QuotationHelper(userService, database, schema, accountability, productService, taxService, businessPartnerService);

    const taxs = await quotationServices.getTaxs();

    const { header, items } = await validateRequest(body, quotationServices, taxs);
    const setting: SettingQuotation = await settingService.readSingleton({ fields: ['*', 'default_emails.* '] });

    const quotationID = await quotationsService.createOne({
      ...header,
      ...(setting.no_with_sap ? { status: 'O' } : {}),
      items,
    });

    if (setting.allow_create_pdf_with_sapId || setting.no_with_sap) {
      const fileService = new FilesService({
        schema,
        accountability,
      });

      const quotationData: TQuotation = await quotationsService.readOne(quotationID, { fields: ['*.*'] });

      const { itbms, subTotal, total } = await calculate(quotationData);

      let dataToPdf = {
        ...quotationData,
        ...(setting.no_with_sap ? { id: quotationData.id } : { id: quotationData.sapId }),
        itbms: itbms.toNumber(),
        subTotal: subTotal.toNumber(),
        total: total.toNumber(),
        items: quotationData.items,
      };

      //@ts-ignore
      const stream = await generatePFD({ files: setting, data: dataToPdf });

      const name = quotationData.id;
      const pdfData = await fileService.uploadOne(stream, {
        title: name,
        filename_disk: `${name}.pdf`,
        filename_download: `${name}.pdf`,
        type: 'application/pdf',
        storage: 'local',
        folder: env.QUOTATION_FOLDER_SAVE,
      });

      await quotationsService.updateOne(quotationID, { pdf: pdfData, create: true });
    }

    await transaction.commit();
    return { id: quotationID };
  } catch (error) {
    await transaction.rollback();
    return res.status(500).send(getErrorMessage(error));
  }
};
