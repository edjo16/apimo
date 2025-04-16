import { defineHook } from '@directus/extensions-sdk';

export default defineHook(({ filter },) => {
	filter('users.update', async (meta: { date_updated?: Date }) => {
		return 'last_page' in meta ? meta : { ...meta, date_updated: new Date() }
	});

	filter('users.create', async (meta: { date_created?: Date }) => {
		return { ...meta, date_created: new Date() }
	});

});
