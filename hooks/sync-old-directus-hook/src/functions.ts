/* const _ = require('lodash');

export const compareObjects = (object1: any, object2: any) => {
  const diferencias = _.omitBy(object1, (valor: any, clave: string) => _.isEqual(valor, object2[clave]));
  console.log('payload que sale de filtrar ', diferencias);
  return diferencias ?? null;
};
 */
export const compareObjects = (object1: any, object2: any) => {
  let payload: any = {};
  for (let key in object1) {
    const value1 = validate(object1[key]);
    const value2 = validate(object2[key]);
    if (value1 !== value2) payload[key] = value1;
  }
  console.log('Diferencias: ', payload);
  return Object.keys(payload).length > 0 ? payload : null;
}

export const validate = (value: any) => {
  return typeof value === 'boolean' ? value.toString() : value ? value.toString() : null;
}