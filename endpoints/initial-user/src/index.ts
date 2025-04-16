import { defineEndpoint } from '@directus/extensions-sdk';
import {  } from '@directus/types';
import { DefaultValuesCanList, ICanList, IMenu, IPermission } from './types';
import { findIndex } from './funtions';

interface IQuery {
	fields?: string[],
	filter: { status?: Object, access?: object, },
	sort?: string[]
}

export default defineEndpoint((router, { services }:any) => {
	const { ItemsService , UsersService } = services;

	router.get('/', async ({ schema, accountability }: any, res: { json: (arg0: any) => any; }, next: (arg0: any) => any) => {
		const MenuService = new ItemsService('sys_menu', { schema, accountability });
		const UserService = new UsersService({ schema, accountability });
		const { user, admin, permissions, role } = accountability;

		if (!user) res.status(500).json({error:'Invalid Credential'});
		try {
			const userAcc = UserService.readOne(user, {
				fields: ["id", "first_name", "last_name", "email", "location", "title", "description", "avatar", "language", "theme", "role.id", "role.name", "phone", "configuration_theme"]
			});

			const query: IQuery = {
				fields: ["id", "title", "subject", "path", "icon", "type", "father.id", "father.father"],
				filter: { status: { _eq: "A" } },
				sort: ["type", "sort"]
			}
			
			const findMenu: IMenu[] = MenuService.readByQuery(query)
			
	if (!admin) {
				query.filter.access = { directus_roles_id: { _eq: role } }
			}
			return Promise.all([userAcc, findMenu])
				.then(([userAcc, findMenu]) => {
					const menu: IMenu[] = []
					const subjectList: Array<String> = []
					const action = "read"
					const canList: Array<ICanList> = DefaultValuesCanList
				
					findMenu.forEach((item: IMenu) => {
						
						if (item.type === 'C') {
							//busca el menu
							const i = findIndex(item.father?.father, "id", menu)
							//busca el submenu
							const ind = findIndex(item.father?.id, "id", menu[i].children)

							if (i >= 0 && ind >= 0) {
								const { id, title, subject, path, icon } = item
								if (menu[i]?.children[ind].children) {
									menu[i]?.children[ind].children.push({ id, title, subject, action, path, icon })
								} else {
									menu[i].children[ind].children = [{ id, title, subject, action, path, icon }]
								}

							}

						} else if (item.type === 'B') {
							const i = findIndex(item.father.id, "id", menu)
							if (i >= 0) {
								const { id, title, subject, path, icon } = item
								if (menu[i].children) {
									menu[i].children.push({ id, title, subject, action, path, icon })
								} else {
									menu[i].children = [{ id, title, subject, action, path, icon }]
								}
							}
						} else {
							const { id, title, subject, path, icon } = item
							menu.push({ id, title, subject, action, path, icon })
						}
						subjectList.push(item.subject)
					})
				
					permissions.forEach((element: IPermission) => {
						const { collection, action } = element
						const i = findIndex(collection, "collection", canList)

						if (i >= 0) {
							if (canList[i]?.collection === collection) {
								canList[i]?.action.push(action)
							}
						} else {
							canList.push({ collection, action: [action] })
						}
					});

				
					return res.json({ ...userAcc, menu, subjectList, canList })

		}).catch((data) => {console.log(data) } ) 


		} catch (error) {
			return res.status(500).json({error:'Errror'});

		}

	});


});
