import { Field } from './type';
import { defineHook } from '@directus/extensions-sdk';
import { ApiExtensionContext, Query } from '@directus/types';
import { COMPANY_NAME, COMPANY_CODE, DATE_CREATED, DATE_UPDATED, NUMBER_ORDER, VERSION, USER_CREATED_FIELD, USER_UPDATE_FIELD, ALL_FIELDS } from './constants'


export default defineHook(({ action }, ApiExtension: ApiExtensionContext) => {
	action('collections.create', async (payload) => {
		const { services: { FieldsService, ItemsService }, getSchema, database } = ApiExtension;
		const schema = await getSchema();
		if (payload.payload.collection.startsWith("rep_") && !payload.payload.singleton) {
			const feildsService = new FieldsService({ schema, knex: database, });
			const relationService = new ItemsService('directus_relations', { schema, knex: database, });
			const fieldsService = new ItemsService('directus_fields', { schema, knex: database, });
			const collectionService = new ItemsService('directus_collections', { schema, knex: database, });

			await Promise.all([
				feildsService.createField(payload.payload.collection, COMPANY_NAME),
				feildsService.createField(payload.payload.collection, COMPANY_CODE),
				feildsService.createField(payload.payload.collection, NUMBER_ORDER),
				feildsService.createField(payload.payload.collection, VERSION),
				feildsService.createField(payload.payload.collection, DATE_CREATED),
				feildsService.createField(payload.payload.collection, USER_CREATED_FIELD),
				feildsService.createField(payload.payload.collection, DATE_UPDATED),
				feildsService.createField(payload.payload.collection, USER_UPDATE_FIELD),
				relationService.createOne({ many_collection: payload.payload.collection, many_field: USER_CREATED_FIELD.field, one_collection: 'directus_users', one_deselect_action: 'nullify' }),
				relationService.createOne({ many_collection: payload.payload.collection, many_field: USER_UPDATE_FIELD.field, one_collection: 'directus_users', one_deselect_action: 'nullify' })
			]);

			const query: Query = {
				fields: ['id', 'sort', 'field'],
				filter: {
					_and: [
						{ collection: { _eq: payload.payload.collection } },
						{ field: { _in: ALL_FIELDS } }
					]
				},
				limit: -1,
				sort: ['sort']
			}

			const fields: Field[] = await fieldsService.readByQuery(query);
			await Promise.all([
				...ALL_FIELDS.map(async (field, i) => {
					const f = fields.find(f => f.field === field);
					return fieldsService.updateOne(f?.id, { sort: i + 30 });
				}),
				collectionService.updateOne(payload.payload.collection, { group: 'Reports' }),
			]);
		}

	});
});