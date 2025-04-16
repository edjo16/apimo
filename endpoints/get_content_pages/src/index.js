
export default ((router, { services, exceptions }) => {
    const { ItemsService } = services;
    const { ServiceUnavailableException } = exceptions;


    router.get('/', (req, res, next) => {
        const categoriesService = new ItemsService('categorias', { schema: req.schema, accountability: req.accountability });
        const companyService = new ItemsService('company_data', { schema: req.schema, accountability: req.accountability });
        const slidesService = new ItemsService('slides', { schema: req.schema, accountability: req.accountability });
        const brandsService = new ItemsService('brands', { schema: req.schema, accountability: req.accountability });
        const ContentService = new ItemsService('contentpages', { schema: req.schema, accountability: req.accountability });
        const minibannersService = new ItemsService('minibanners', { schema: req.schema, accountability: req.accountability });
         const menuService = new ItemsService('menuweb', { schema: req.schema, accountability: req.accountability });
        const countriesService = new ItemsService('countries', { schema: req.schema, accountability: req.accountability });
        const projectsService = new ItemsService('projects', { schema: req.schema, accountability: req.accountability });
        const citiesService = new ItemsService('deliverycities', { schema: req.schema, accountability: req.accountability });
        const paymentsService = new ItemsService('paymenttype', { schema: req.schema, accountability: req.accountability });
        // Find for Categories
        const categories = categoriesService.readByQuery({
                fields: ["id", "descripcion", "categoryimage", "status", "subcategories.id", "subcategories.descripcion", "subcategories.subcategoryimage", "subcategories.status", "subcategories.slug","subcategories.discount"],
                filter: { status: { _eq: "published" } },
                limit: -1
            })
            .then((results) => {
                const allCategories = results;
                const menu = []; // dropdowns con sus hijos y los links
                const categories = [];// solo categorias limpias
                const more = [];// despues de los 10 elementos agrupamos en mas...
				const spaceReplace =(string)=> string.replace(/\s/g, "_");

                for (let i = 0; i < allCategories.length; i++) {
                    const links = [];
                    const subcategories = [];
                    const category = allCategories[i];
                    category.url = `/shop/categoria/${spaceReplace(category.descripcion)}/${category.id}`;

                    //Recorrer las subcategorias para evitar las que no esten published y armar los links del dropdowns
                    category.subcategories.forEach((subcategory) => {
                        if (subcategory.status === 'published') {
                            subcategory.url = `/shop/categoria/${spaceReplace(category.descripcion)}/subcategoria/${spaceReplace(subcategory.descripcion)}/${category.id}/${subcategory.id}`;
                            links.push({ id: subcategory.id, title: subcategory.descripcion, url: subcategory.url });
                            subcategories.push(subcategory);
                        }
                    });
                    //Sobreescribo las subcategorias de esta categoria para evitar aquellas que no sean status === published
                    category.subcategories = subcategories;
                    //si no tenemos los 9 elementos aun del menu o dropdowns... el elemento 10 es "mas..." donde se agrupa el resto de las categorias
                    if (i < 10) {
                        menu.push({
                            title: category.descripcion,
                            url: category.url,
                            submenu: {
                                type: 'megamenu',
                                menu: {
                                    size: 'sm',
                                    columns: [{
                                        size: 12,
                                        links: [{
                                            title: category.descripcion,
                                            url: category.url,
                                            links
                                        }]
                                    }]
                                }
                            }
                        });
                    } else {
                        more.push({
                            title: category.descripcion,
                            url: category.url,
                            submenu: links
                        });
                    }

                    //Incluir a Categories
                    categories.push(category);
                }

                // Incluir el item "mas.." al final del menu
                menu.push({
                    title: 'Ver mas...',
                    url: '/shop',
                    submenu: {
                        type: 'menu',
                        menu: more
                    }
                });
                return { categories, menu }
            })
			//  Find for Company Data ICA
			 const company = companyService
			 .readByQuery({
				 fields: ['code', 'name', 'phone', 'address', 'attention_hours', 'contactus_comment', 'customer_service', 'email', 'logo'],
                 filter: {
                    code: { _eq: "ICA" }
                }
			 })
 
		 //Find for Slides
		 const slides = slidesService
			 .readByQuery({
				 fields: ["id", "url", "background", "image", "imagemobile"],
				 filter: {
					 status: { _eq: "published" }
				 },
				 limit: -1
			 })
             //Find for brands
		 const contentPages = ContentService
         .readByQuery({
             fields: ["title", "tagline", "body", "key"],
             filter: {
                 status: { _eq: "published" }
             },
             limit: -1
         })
         //Find for brands
		 const projects = projectsService
         .readByQuery({
             fields: ["id", "title", "body", "projectimage","descripcion", "projectimages"],
             filter: {
                 status: { _eq: "published" }
             },
             limit: -1
         })


		 //Find for brands
		 const brands = brandsService
			 .readByQuery({
				 fields: ["name", "url", "logo"],
				 filter: {
					 status: { _eq: "published" }
				 },
				 limit: -1
			 })
 
		 //Find for menu
		 const menuweb = menuService
			 .readByQuery({
				 fields: ["id", "url", "title"],
				 filter: {
					 status: { _eq: "published" }
				 },
				 limit: -1
			 })
 
 
		 //Find for minibanners
		 const minibanners = minibannersService
			 .readByQuery({
				 fields: ["id", "image", "url"],
				 filter: {
					 status: { _eq: "published" }
				 },
				 limit: 4
			 })
 
		 //Find for countries
		 const countries = countriesService
			 .readByQuery({
				 fields: ["id","countrycode", "countryname"],
				 limit: -1,
			 })
 
		 //Find for cities
		 const deliverycities = citiesService
			 .readByQuery({
				 fields: ["id","cityname"],
				 limit: -1
			 })
 
		 //Find for payments
		 const payments = paymentsService
			 .readByQuery({
				 fields: ["id","key", "title", "description"],
				 filter: {
					 status: { _eq: "published" }
				 },
				 limit: -1
			 })
          

        //Find for Company Data ICA

        return Promise.all([categories, company, slides,menuweb, brands,contentPages,minibanners,projects, countries,payments, deliverycities])
            .then((response) => {
                return res.json({
                    categories: response[0].categories,
					menu: response[0].menu,
                    company: response[1],
                    slides: response[2],
                    menuweb: response[3],
                    brands: response[4],
                    contentPages:response[5],
                    miniBanners: response[6],
                    projects:response[7],
                    countries: response[8],
                    payments: response[9],
                    deliverycities: response[10],
                    filters:[]
                })
            });
    });
});
