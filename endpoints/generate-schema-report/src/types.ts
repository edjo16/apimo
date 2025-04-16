export type Collection = {
  collection: string;
  group: string;
  icon: string;
  title: string;
  note: string;
};

export enum ValidationsType {
  NUMBER = "number",
  REQUIRED = "required",
  MAX_LENGTH = "maxLength",
  MIN_LENGTH = "minLength",
  MIN = "min",
  MAX = "max",
}
