import { Request, Router } from "express";
import { defineEndpoint } from "@directus/extensions-sdk";
import { HookExtensionContext } from "@directus/types";
import { REPORT_FOLDER_NAME } from "./constants";
import { getSchema } from "./functions";

export default defineEndpoint(
	(router: Router, ApiExtension: HookExtensionContext) => {
		router.get(
			"/",
			async (
				req: unknown,
				res: {
					status: (arg0: number) => {
						(): any;
						new(): any;
						json: { (arg0: any[]): any; new(): any };
						send: { (arg0: string): any; new(): any };
					};
				},
				_next: any
			) => {
				const {
					services: { ItemsService, database, FieldsService },
				} = ApiExtension;
				const { schema, accountability } = req as unknown as Request & {
					schema: any;
					accountability: any;
				};

				const collectionService = new ItemsService("directus_collections", {
					schema,
					knex: database,
					accountability,
				});

				const feildsService = new FieldsService({
					schema,
					knex: database,
					accountability,
				});

				const relationsService = new ItemsService("directus_relations", {
					schema,
					knex: database,
					accountability,
				});

				const schemasHeaderService = new ItemsService("sys_schemas_header", {
					schema,
					knex: database,
					accountability,
				});

				try {
					const schema = await getSchema({ schemasHeaderService, isChindren: false, collectionService, feildsService, relationsService, filter: { group: { _eq: REPORT_FOLDER_NAME } }, });
					return res.status(200).json(schema);
				} catch (error) {
					console.error(error);
					return res.status(500).send("ERROR");
				}
			}
		);
	}
);
