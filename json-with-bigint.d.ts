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

interface JsonObject {
  [x: string]: Json;
}

interface JsonArray extends Array<Json> {}

export function JSONStringify(data: Json, space?: string | number): string;

export function JSONParse<T extends Json = Json>(serializedData: string): T;
