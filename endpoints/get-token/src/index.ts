import { defineEndpoint } from "@directus/extensions-sdk";
import { HookExtensionContext, Query } from "@directus/types";
import { Router } from "express";

export default defineEndpoint(
	(router: Router, ApiExtension: any) => {
		router.get("/", async (req: any, res: any, _next: any) => {
			const { services: { ActivityService, AuthenticationService }, database } = ApiExtension;
			const { body, schema, accountability } = req;
			const authService = new AuthenticationService({ knex: database, schema });

			const user = await authService.login(null, body);
			console.log(user);


			/* 			try {
							await database.transaction(async (trx: any) => {
								
								const token = await trx.select("token")
									.from("directus_users")
									.where({ id: accountability.user });
			
								return res.status(200).send(token[0]);
							});
						} catch (e) {
							return res.status(403).json({ error: 'Server Error!.' });
						} */

		});
	}
);
