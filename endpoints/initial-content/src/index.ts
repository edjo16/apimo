import { defineEndpoint } from "@directus/extensions-sdk";
import { ApiExtensionContext } from "@directus/shared/types";
import Express from "express";

export default defineEndpoint((router, { services, exceptions }: ApiExtensionContext) => {
	const { ItemsService } = services;
	const { UnexpectedResponseException } = exceptions;

	router.get("/", async ({ schema, accountability }: any, res: Express.Response, next: Express.NextFunction) => {
		try {
			/*Header*/
			const topPanelService = new ItemsService("hom_top_panel", { schema, accountability });
			const navbarService = new ItemsService("hom_navbar", { schema, accountability });
			const socialMediaService = new ItemsService("social_media", { schema, accountability });

			/*Body*/
			const sliderService = new ItemsService("hom_slider", { schema, accountability });
			const principlesService = new ItemsService("hom_principles", { schema, accountability });
			const weAreService = new ItemsService("hom_we_are", { schema, accountability });
			const serviceService = new ItemsService("hom_services", { schema, accountability });
			const servicesService = new ItemsService("services", { schema, accountability });

			const whyChooseService = new ItemsService("hom_why_choose_us", { schema, accountability });
			const testimonyService = new ItemsService("hom_testimony", { schema, accountability });
			const projectService = new ItemsService("hom_project", { schema, accountability });
			const brandsService = new ItemsService("hom_brands", { schema, accountability });
			
			/*Footer*/
			const footerService = new ItemsService("hom_footer", { schema, accountability });
			const usefulLinksService = new ItemsService("useful_links", { schema, accountability });
			const officeHoursService = new ItemsService("office_hours", { schema, accountability });

			const topPanel = topPanelService.readOne(1, {
				fields: ["id","contact_number", "mail_contact"],
			});

			const navbar = navbarService.readOne(1, {
				fields: ["id","icon_company", "icon_company_dark", "internal_message", "internal_icon"],
			});

			const socialMedia = socialMediaService.readByQuery({
				fields: ["id","social_medias", "url"],
				filter: { status: { _eq: "A" } },
				limit: -1,
			});

			const slider = sliderService.readByQuery({
				fields: ["id","image", "title_top", "title_middle", "description"],
				filter: { status: { _eq: "A" } },
				limit: -1,
			});

			const principles = principlesService.readByQuery({
				fields: ["id","title", "description"],
				filter: { status: { _eq: "A" } },
				limit: -1,
			});

			const weAre = weAreService.readOne(1, {
				fields: ["id","title", "description", "image"],
			});

			const service = serviceService.readOne(1, {
				fields: ["id","title", "description"],
			});

			const services = servicesService.readByQuery({
				fields: ["id","title", "description", "image_title", "imagen_slider", "features.name", "features.status"],
				filter: { status: { _eq: "A" } },
				sort: ['id'],
				limit: 20,
			});

			const whyChoose = whyChooseService.readOne(1, {
				fields: ["id","title", "description", "sertificate_name", "years_experience", "title_image", "image", "features.name", "features.status"],
			});

			const testimony = testimonyService.readOne(1, {
				fields: ["id","quote", "responsible", "image", "degree"],
			});

			const project = projectService.readOne(1, {
				fields: ["id","title", "description", "sertificate_name", "years_experience", "title_image", "image","projects.id", "projects.status", "projects.title", "projects.description", "projects.icon_image"],
			});

			const brand = brandsService.readOne(1, {
				fields: ["id","title", "brands.status", "brands.name", "brands.url", "brands.icon"],
			});

			const footer = footerService.readOne(1, {
				fields: ["id","description", "rights_reserved", "image"],
			});

			const usefulLinks = usefulLinksService.readByQuery({
				fields: ["id","name", "url", "page"],
				filter: { status: { _eq: "A" } },
				limit: -1,
			});

			const officeHours = officeHoursService.readByQuery({
				fields: ["id","title", "title_right"],
				filter: { status: { _eq: "A" } },
				limit: -1,
			});

			return Promise.all([topPanel, navbar, socialMedia, slider, principles, weAre, service, services, whyChoose, testimony, project, brand, footer, usefulLinks, officeHours]).then(
				(result: any) => {
					const [topPanel, navbar, socialMedia, slider, principles, weAre, service, services, whyChoose, testimony, project, brand, footer, usefulLinks, officeHours] = result;
					const servicesActives = services.map((serv: any) => ({ ...serv, features: serv.features.filter((item: any) => item.status === "A") }));

					whyChoose.features = whyChoose.features.filter((item: any) => item.status === "A");
					project.projects = project.projects.filter((item: any) => item.status === "A");
					brand.brands = brand.brands.filter((item: any) => item.status === "A");
					footer.usefulLinks = usefulLinks;
					footer.officeHours = officeHours;

					return res.status(200).json({ topPanel, navbar, socialMedia, slider, principles, weAre, service, services: servicesActives, whyChoose, testimony, project, brand, footer });
				}
			);
		} catch (error: unknown) {
			return next(new UnexpectedResponseException(error));
		}
	});
});
