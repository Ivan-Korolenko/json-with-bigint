type JsonObject = {
  [x: string]: Json;
};

type JsonArray = Json[];

export type Json =
  | null
  | undefined
  | string
  | number
  | bigint
  | boolean
  | JsonObject
  | {}
  | JsonArray;

export function JSONStringify(
  data: Exclude<Json, undefined>,
  space?: string | number
): string;

export function JSONStringify(
  data: undefined,
  space?: string | number
): undefined;

export function JSONParse<T extends Json = Json>(serializedData: string): T;
