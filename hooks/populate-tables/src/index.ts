
import axios from 'axios';
import { defineHook } from '@directus/extensions-sdk';
import { ApiExtensionContext, Query } from '@directus/types';

const url = 'https://api.icautomatizados.com/public/icaweb/custom/data/all';

export default defineHook(({ action }, ApiExtension: ApiExtensionContext) => {
	action('server.start', async (_server) => {
		const { services: { ItemsService }, getSchema, env, database } = ApiExtension;
		const options = {
			headers: { Authorization: `Bearer ${env.USER_OLD_DIRECTUS_TOKEN}` }
		};

		const schema = await getSchema();
		const businessPartnerService = new ItemsService("sys_business_partner", { schema });
		const query: Query = { fields: ['code'] };
		const partner = await businessPartnerService.readByQuery(query);

		if (!partner.length) {
			const data = await axios.post(url, null, options).then(res => res.data);
			const { partners, contacts, salesOrders, salesItems } = data;

			await database.transaction(async (trx: any) => {
				await trx
					.insert(partners)
					.into('sys_business_partner')
					.returning('code')
					.then((res: any) => console.log('Socios de negocio insertados Exitosamente.!, siendo : ' + res.length));

				await trx
					.insert(contacts)
					.into('sys_contacts')
					.returning('id')
					.then((res: any) => console.log('contactos insertados Exitosamente.!, siendo : ' + res.length));

				await trx
					.insert(salesOrders)
					.into('sales_orders')
					.returning('number')
					.then((res: any) => console.log('Ordenes de Venta insertados Exitosamente.!, siendo : ' + res.length));

				await trx
					.insert(salesItems)
					.into('sales_items')
					.returning('sapid')
					.then((res: any) => console.log('items insertados Exitosamente.!, siendo : ' + res.length));
			});
		}
	});
});