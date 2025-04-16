import { IFindMenu } from "./types";

export const findIndex = (value: number | string, field: string, array?: Array<IFindMenu>) => array!.findIndex((e) => e?.[field] == value)
