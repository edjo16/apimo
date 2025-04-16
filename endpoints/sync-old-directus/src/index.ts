import { defineEndpoint } from "@directus/extensions-sdk";
import { Router } from "express";
import { TypeChange } from "./types";
import SaleOrder from "./SaleOrder";
import SaleItem from "./SaleItem";
import Partner from "./Partner";
import Contact from "./Contact";
import { EndpointExtensionContext } from "@directus/types";

const changesTypes = {
	[TypeChange.SALE_ORDER]: SaleOrder,
	[TypeChange.SALE_ITEM]: SaleItem,
	[TypeChange.BUSINESS_PARTNER]: Partner,
	[TypeChange.CONTACT]: Contact,
};

export default defineEndpoint(
	(router: Router, ApiExtension: EndpointExtensionContext) => {
		router.post("/", async (req, res, _n) => {
			const { body } = req as unknown as Request & {
				body: any;
				schema: any;
				accountability: any;
			};
			const {
				services: { ItemsService },
				database,
				getSchema,
			} = ApiExtension;
			const schema = await getSchema();
			const transaction = await database.transaction();
			try {
				const changeService = new ItemsService("changes", {
					schema,
					transaction,
				});
				//@ts-ignore
				const resolver = changesTypes[body.type];
				let data;
				if (resolver) {
					console.log(`Procesando cambio Tipo: ${body.type}`);
					data = await resolver(body, ItemsService, schema, transaction);
					console.log(`Procesado:  ${data.id}`);
				} else console.log("Tipo no permitido.");

				if (data && data !== "omit") {
					await changeService.createOne({
						type: body.type,
						action: body.action,
						payload: body,
					});
				}

				await transaction.commit();
				return res.status(200).json({ "hola": "hola" });
			} catch (error) {
				await transaction.rollback();
				console.error(error);
				return res.status(400);
			}
		});
	}
);
