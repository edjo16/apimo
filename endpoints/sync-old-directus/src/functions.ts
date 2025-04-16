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

export const isValidToChange = (value: string) => {
  return value.startsWith('PRY-') || value.startsWith('ARTMIX-') || value.startsWith('SERV-') ? true : false;
}