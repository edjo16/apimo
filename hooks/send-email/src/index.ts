import { defineHook } from "@directus/extensions-sdk";
import { Collection, Company } from "./types";
import { accountabilityAd, currentDate, emailTemplate } from "./functions";

export default defineHook(({ action }, { services, env }) => {
	const { ItemsService, MailService, UsersService } = services;

	action("items.update", async (meta, { schema, accountability, database }) => {
		const { collection, keys } = meta as {
			payload: any;
			collection: string;
			keys: string[];
		};

		const isValid = collection.split("_").shift();
		if (isValid == "rep") {

			const collectionService = new ItemsService("directus_collections", {
				schema,
				knex: database,
				accountability,
			});

			const collectionData: Collection = await collectionService.readOne(
				collection,
				{
					fields: [
						"collection",
						"nameReport",
						"title",
						"header",
						"footer",
						"group",
					],
				}
			);

			if (collectionData.group == "Reports") {

				const emailService = new MailService({ schema, accountability });

				const companyService = new ItemsService("sys_company", {
					schema,
					knex: database,
					accountability,
				});

				const reportService = new ItemsService(collectionData.collection, {
					schema,
					knex: database,
					accountability,
				});

				const userService = new UsersService({ schema, knex: database, accountability: accountabilityAd });

				const report = await reportService.readOne(keys[0], { fields: ["*"] });

				const company: Company[] = await companyService.readByQuery({
					fields: ["id", "companyLogo", "emails.email"],
					filter: { emails: { status: { _eq: "A" } } },
				});

				const emails = company[0]?.emails.map((e) => e.email).join(",");

				const user = await userService.readOne(report.userUpdated, {
					fields: ["email"],
				});

				const body = emailTemplate({
					payload: {
						numberOrder: report?.numberOrder,
						companyName: report?.companyName,
						version: report?.version,
					},
					isUpdate: true,
					nameReport: collectionData.nameReport ?? 'ERROR',
					...(company[0]?.companyLogo ? { logo: `${env.HOST_DOMAIN}/assets/${company[0]?.companyLogo}` } : {}),
					...(collectionData.header ? { header: `${env.HOST_DOMAIN}/assets/${collectionData.header}` } : {}),
				});

				await emailService.send({
					to: [emails, user?.email],
					subject: `Reporte ${collectionData.nameReport} / OV: ${report.numberOrder} - ${currentDate()}`,
					html: body,
					attachments: [
						{
							filename: `REPORTE-${collectionData.nameReport}.pdf`,
							path: `${env.HOST_DOMAIN}/assets/${report.pdf}`,
						},
					],
				});
			}
		}


	});

	action("items.create", async (meta, { schema, accountability, database }) => {
		const { payload, collection } = meta as {
			payload: any;
			collection: string;
		};

		const isValid = collection.split("_").shift();
		if (isValid == "rep") {
			const collectionService = new ItemsService("directus_collections", {
				schema,
				knex: database,
				accountability,
			});

			const collectionData: Collection = await collectionService.readOne(
				collection,
				{
					fields: [
						"collection",
						"nameReport",
						"title",
						"header",
						"footer",
						"group",
					],
				}
			);

			if (collectionData.group == "Reports") {
				const emailService = new MailService({ schema, accountability });
				const companyService = new ItemsService("sys_company", {
					schema,
					knex: database,
					accountability,
				});
				const userService = new UsersService({ schema, accountability });

				const company: Company[] = await companyService.readByQuery({
					fields: ["id", "companyLogo", "emails.email"],
					filter: { emails: { status: { _eq: "A" } } },
				});

				const emails = company[0]?.emails.map((e) => e.email).join(",");

				const user = await userService.readOne(payload.userCreated, {
					fields: ["email"],
				});

				const body = emailTemplate({
					payload: {
						numberOrder: payload?.numberOrder,
						companyName: payload?.companyName,
						version: payload?.version,
					},
					isUpdate: false,
					nameReport: collectionData.nameReport ?? 'ERROR',
					...(company[0]?.companyLogo ? { logo: `${env.HOST_DOMAIN}/assets/${company[0]?.companyLogo}` } : {}),
					...(collectionData.header ? { header: `${env.HOST_DOMAIN}/assets/${collectionData.header}` } : {}),

				});

				await emailService.send({
					to: [emails, user?.email],
					subject: `Reporte ${collectionData.nameReport} / OV: ${payload.numberOrder} - ${currentDate()}`,
					html: body,
					attachments: [
						{
							filename: `REPORTE-${collectionData.nameReport}.pdf`,
							path: `${env.HOST_DOMAIN}/assets/${payload.pdf}`,
						},
					],
				});
			}
		}
	});
});




