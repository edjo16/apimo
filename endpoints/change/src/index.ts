import { Router } from "express";
import { defineEndpoint } from "@directus/extensions-sdk";
import { HookExtensionContext, Query } from "@directus/types";
import { RawBody } from "./types";
import { getErrorMessage } from "./error";

export default defineEndpoint((router: Router, ApiExtension: HookExtensionContext) => {
	router.post("/", async (req: any, res: any, _next: any) => {
		const { services: { ItemsService, FilesService }, database } = ApiExtension;
		const { body: { type, action, payload }, schema, accountability } = req;
		const transaction = await database.transaction();
		const changeService = new ItemsService('changes', { schema, accountability, transaction })
		const copyBody = { ...req.body };
		const id = payload.id;

		try {
			if (action === "C") {
				await new ItemsService(type, { schema, accountability, transaction }).createOne(payload);
			} else if (action === "U") {
				delete payload.id

				if ('deleteFiles' in payload) {
					const fileService = new FilesService({ knex: database, schema, accountability, transaction });
					await fileService.deleteByQuery({ filter: { filename_download: { _in: payload.deleteFiles } } });
					delete payload.deleteFiles;
				}
				await new ItemsService(type, { schema, accountability, transaction }).updateOne(id, payload);

			} else if (action === "D") {
				await new ItemsService(type, { schema, accountability, transaction }).deleteOne(payload.id);
			} else {
				return res.status(500).send({ error: 'acción no permitida.' });
			}

			await changeService.createOne({
				...copyBody, payload: {
					...payload,
					id: id
				}
			});
			await transaction.commit();


			return res.status(200).send({ mjs: 'exito' });

		} catch (error: any) {
			await transaction.rollback();
			return res.status(500).send(error);
		}
	});

	router.post("/get", async (req, res, _next) => {
		const {
			services: { ItemsService },
		} = ApiExtension;
		const { body, schema, accountability } = req as unknown as Request & {
			body: string[];
			schema: any;
			accountability: any;
		};
		const changeService = new ItemsService("changes", {
			schema,
			accountability,
		});
		try {
			console.log(body);
			const query: Query = {
				fields: ["id", "date_created", "action", "type", "payload"],
				filter: { id: { _nin: body } },
				limit: -1,
				sort: ["date_created"],
			};
			const response = await changeService.readByQuery(query);
			console.log(response);
			return res.status(200).json(response);
		} catch (error) {
			console.error(error);
			return res.status(500).send(getErrorMessage(error));
		}
	});

	router.get("/users", async (req, res, _next) => {
		const {
			services: { ItemsService },
		} = ApiExtension;
		const { schema, accountability } = req as unknown as Request & {
			body: string[];
			schema: any;
			accountability: any;
		};
		const userService = new ItemsService({ schema, accountability });
		try {
			const query: Query = {
				fields: [
					"id",
					"first_name",
					"last_name",
					"email",
					"password",
					"location",
					"title",
					"theme",
					"status",
					"token",
					"role.name",
				],
				filter: { status: { _eq: "active" } },
				limit: -1,
			};
			const users = await userService.readByQuery(query);
			return res.status(200).json(users);
		} catch (error) {
			console.error(error);
			return res.status(500).send(getErrorMessage(error));
		}
	});

	router.get("/business-partner", async (req, res, _next) => {
		const {
			services: { ItemsService },
		} = ApiExtension;
		const { schema, accountability } = req as unknown as Request & {
			schema: any;
			accountability: any;
		};
		const partnerService = new ItemsService("sys_business_partner", {
			schema,
			accountability,
		});
		try {
			const query: Query = {
				fields: [
					"code",
					"name",
					"ruc",
					"dv",
					"status",
					"contact",
					"type",
					"email",
					"phone1",
					"phone2",
					"address",
					"contacts.id",
					"contacts.status",
					"contacts.name",
					"contacts.position",
					"contacts.email",
					"contacts.phone1",
					"contacts.phone2",
					"contacts.address",
					"salesOrder.number",
					"salesOrder.docEntry",
					"salesOrder.status",
					"salesOrder.dateExpiration",
					"salesOrder.docTotal",
					"salesOrder.canceled",
					"salesOrder.comments",
					"salesOrder.items.id",
					"salesOrder.items.status",
					"salesOrder.items.code",
					"salesOrder.items.name",
					"salesOrder.items.qty",
					"salesOrder.items.openQty",
					"salesOrder.items.sapid",
				],
				filter: { status: { _eq: "A" } },
				limit: -1,
			};
			const find = await partnerService.readByQuery(query);

			const response = find.reduce((partners: any[], partner: any) => {
				const orders = partner.salesOrder?.reduce(
					(orders: any[], order: any) => {
						if (order.canceled === "Y") return orders;
						const items = order.items?.filter(
							(item: any) =>
								item.code.startsWith("SERV-") ||
								item.code.startsWith("PRY-") ||
								item.code.startsWith("EMP-") ||
								item.code.startsWith("ARTMIX-")
						);
						if (items.length > 0) orders.push({ ...order, items });
						return orders;
					},
					[]
				);
				if (orders.length > 0)
					partners.push({ ...partner, salesOrder: orders });
				return partners;
			}, []);

			return res.status(200).json(response);
		} catch (error) {
			console.error(error);
			return res.status(500).send(getErrorMessage(error));
		}
	});

	router.post("/business-partner/new", async (req, res, _next) => {
		const {
			services: { ItemsService },
		} = ApiExtension;
		const { schema, accountability, body } = req as unknown as Request & {
			schema: any;
			accountability: any;
		};
		const partnerService = new ItemsService("sys_business_partner", {
			schema,
			accountability,
		});
		try {
			const query: Query = {
				fields: [
					"code",
					"name",
					"ruc",
					"dv",
					"status",
					"contact",
					"type",
					"email",
					"phone1",
					"phone2",
					"address",
					"contacts.id",
					"contacts.status",
					"contacts.name",
					"contacts.position",
					"contacts.email",
					"contacts.phone1",
					"contacts.phone2",
					"contacts.address",
					"salesOrder.number",
					"salesOrder.docEntry",
					"salesOrder.status",
					"salesOrder.dateExpiration",
					"salesOrder.docTotal",
					"salesOrder.canceled",
					"salesOrder.comments",
					"salesOrder.items.id",
					"salesOrder.items.status",
					"salesOrder.items.code",
					"salesOrder.items.name",
					"salesOrder.items.qty",
					"salesOrder.items.openQty",
					"salesOrder.items.sapid",
				],
				filter: { status: { _eq: "A" } },
				limit: -1,
			};
			const find = await partnerService.readByQuery(query);
			const partner: any[] = [];
			let contact: any[] = [];
			const sales: any[] = [];
			const items: any[] = [];

			const response = find.reduce((partners: any[], partner: any) => {
				const orders = partner.salesOrder?.reduce(
					(orders: any[], order: any) => {
						if (order.canceled === "Y") return orders;
						const items = order.items?.filter(
							(item: any) =>
								item.code.startsWith("SERV-") ||
								item.code.startsWith("PRY-") ||
								item.code.startsWith("EMP-") ||
								item.code.startsWith("ARTMIX-")
						);
						if (items.length > 0) orders.push({ ...order, items });
						return orders;
					},
					[]
				);
				if (orders.length > 0)
					partners.push({ ...partner, salesOrder: orders });
				return partners;
			}, []);

			const data = body as unknown as RawBody;

			response.forEach((element: any) => {
				const conts = element.contacts.filter(
					(contact: any) => !data.contactIds.includes(contact.id)
				);

				if (conts.length) contact.push(...conts.map((c: any) => ({ ...c, partnerId: element.code })));

				element.salesOrder.forEach((sale: any) => {
					const saleItems = sale.items.filter(
						(item: any) => !data.itemsIds.includes(item.sapid)
					);

					if (!data.salesIds.includes(sale.number)) {
						delete sale.items;
						sales.push({ ...sale, partnerId: element.code });
					}

					if (saleItems.length) items.push(...saleItems.map((c: any) => ({ ...c, number: sale.number, partnerId: element.code })));
					if (!data.partnerIds.includes(element.code)) {
						delete element.contacts;
						delete element.salesOrder;
						partner.push(element);
					}
				});
			});

			return res.status(200).json({
				partner,
				contact,
				sales,
				items,
			});
		} catch (error) {
			console.error(error);
			return res.status(500).send(getErrorMessage(error));
		}
	});

}
);
