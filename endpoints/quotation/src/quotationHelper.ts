import { TBusinessPartner, TTax, TUser } from './type';

export class QuotationHelper {
  protected database: any;
  protected schema: any;
  protected accountability: any;
  protected userService: any;
  protected productService: any;
  protected taxService: any;
  protected businessPartnerService: any;

  constructor(userService: any, database: any, schema: any, accountability: any, productService: any, taxService: any, businessPartnerService: any) {
    this.database = database;
    this.schema = schema;
    this.accountability = accountability;
    this.userService = userService;
    this.productService = productService;
    this.taxService = taxService;
    this.businessPartnerService = businessPartnerService;
  }

  async getUser(id: string): Promise<TUser> {
    const user: TUser = await this.userService
      .readOne(id, {
        fields: ['id', 'first_name', 'last_name'],
      })
      .catch((e: any) => console.log(e));

    if (!user) throw new Error('Usuario no encontrado');

    return user;
  }

  async getProductByCode(code: string) {
    const product = await this.productService
      .readOne(code, {
        fields: ['code'],
      })
      .catch((e: any) => console.log(e));

    if (!product) throw new Error(`Producto con el codigo ${code} no encontrado`);

    return product;
  }

  async getbusinessPartnerByCode(code: string): Promise<TBusinessPartner> {
    const businessPartner = await this.businessPartnerService
      .readOne(code, {
        fields: ['code', 'name', 'contact'],
      })
      .catch((e: any) => console.log(e));

    if (!businessPartner) throw new Error(`El socio de negocios con el codigo ${code} no encontrado`);

    return businessPartner;
  }

  async getTaxs(): Promise<TTax[]> {
    return this.taxService.readByQuery({
      fields: ['name', 'code', 'value'],
      filter: { status: { _eq: 'A' } },
      limit: -1,
    });
  }
}
