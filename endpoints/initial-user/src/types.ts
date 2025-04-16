
export interface IFindMenu {
    id: number,
    title: string,
    path: string,
    icon: string,
    father: IFater,
    type: string,
    subject: string,
    action:string,
    children?: IFindMenu[]
}

interface IFater {
    id: number,
    father: number
}

export interface IMenu{	
    id: number,
    title: string,
    subject: string,
    action: string,
    path: string,
    icon: string,
    father: IFater,
    type: string,
    children?: IMenu[]
}




export interface ICanList {
    collection: string,
    action: string[]
}

export const DefaultValuesCanList: ICanList[] = [{ collection: '', action: [] }]

export interface IPermissions {
    id: number,
    collection: string,
    action: string,
    role: string
    presets: Object
    fields: Object
    jolk: string[]
    validation: string[]
    permissions: Object
}
export type IPermission = Omit<IPermissions, "id" | "role" | "presets" | "fields" | "jolk" | "validation" | "permissions">;





