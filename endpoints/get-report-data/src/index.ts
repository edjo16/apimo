import { defineEndpoint } from "@directus/extensions-sdk";
import { Router } from "express";
import { EndpointExtensionContext } from "@directus/types";

import { REPORT_FOLDER_NAME } from "./constants";

export default defineEndpoint(
	(router: Router, ApiExtension: EndpointExtensionContext) => {
		router.get("/", async (req, res, _next) => {
			const {
				services: { ItemsService, database },
			} = ApiExtension;
			const { schema, accountability } = req as unknown as Request & {
				body: string[];
				schema: any;
				accountability: any;
			};
			const collectionService = new ItemsService("directus_collections", {
				schema,
				knex: database,
				accountability,
			});
			try {
				const collections: { collection: string }[] =
					await collectionService.readByQuery({
						fields: ["collection"],
						filter: { group: { _eq: REPORT_FOLDER_NAME } },
					});
				const data: any = {};
				for (let name of collections) {
					const service = new ItemsService(name.collection, {
						schema,
						knex: database,
						accountability,
					});

					const dataReport = await service.readByQuery({
						fields: ["*.*"],
						filter: { status: { _eq: "A" } },
						limit: -1,
					});
					data[name.collection] = dataReport;
				}

				return res.status(200).json(data);
			} catch (error) {
				console.error(error);
				return res.status(500).send("ERROR");
			}
		});
	}
);
