import axios from 'axios';
import { defineHook } from '@directus/extensions-sdk';
import { ChangeBody, TypeChange } from './types';
import SaleOrder from './SaleOrder';
import Contact from './Contact';
import Partner from './Partner';
import SaleItem from './SaleItem';
import { HookExtensionContext } from '@directus/types';

const changesUrl = 'https://api.icautomatizados.com/public/icaweb/items/changes';

const changesTypes = {
	[TypeChange.SALE_ORDER]: SaleOrder,
	[TypeChange.SALE_ITEM]: SaleItem,
	[TypeChange.BUSINESS_PARTNER]: Partner,
	[TypeChange.CONTACT]: Contact,
};


export default defineHook(({ schedule }, ApiExtension: HookExtensionContext) => {
	schedule('*/5 * * * *', async () => {
		const { services: { ItemsService }, database, getSchema, env } = ApiExtension;
		const schema = await getSchema();

		console.log('Ejecutando 5 min.......');
		const options = {
			headers: { Authorization: `Bearer ${env.USER_OLD_DIRECTUS_TOKEN}` }
		};

		const changes: ChangeBody[] = await axios.get(`${changesUrl}?fields=id,type,action,payload&filters[error][null]=null&limit=-1`, options).then(res => res.data?.data);

		console.log('changes: ' + changes.length);

		if (!changes.length) {
			console.log('No se encontraron Cambios');
		} else {
			for (const change of changes) {
				const transaction = await database.transaction();
				try {
					const changeService = new ItemsService("changes", { schema, transaction });

					//@ts-ignore
					const resolver = changesTypes[change.type];
					let body;
					if (resolver) {
						console.log(`Procesando cambio:  ${change.id}, Tipo: ${change.type}`);
						body = await resolver(change, ItemsService, schema, transaction);
						console.log(`Procesado:  ${change.id}`);
						if (body) await axios.delete(`${changesUrl}/${change.id}`, options);
					} else console.log('Tipo no permitido.');

					if (body && body !== 'omit') {
						await changeService.createOne({
							type: change.type,
							action: change.action,
							payload: body
						});
					}

					await transaction.commit();
				} catch (error) {
					await transaction.rollback();
					console.error(error);
					await axios.patch(`${changesUrl}/${change.id}`, { error }, options)
				}
			};
		}
	});
});