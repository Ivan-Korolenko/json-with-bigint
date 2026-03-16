export type Replacer = (this: any, key: string, value: any) => any;
export type Reviver = (key: string, value: any, context?: {
    source: string;
}) => any;
export type ExtendedReviver = (key: string, value: any, context: {
    source: string;
} | undefined, reviver: Reviver) => any;
/**
 * Detect if provided for JSON.parse supports the context.source feature.
 * @param {typeof JSON.parse} JSONParse - The JSON.parse function to test.
 * @returns {boolean}
 */
export function isContextSourceSupported(JSONParse: typeof JSON.parse): boolean;
/**
 * Support for JSON.stringify's JSON.rawJSON feature detection.
 * @param {typeof JSON} JSON - The JSON object to test.
 * @returns {boolean}
 */
export function isRawJSONSupported(JSON: typeof globalThis.JSON): boolean;
/**
 * Converts a JavaScript Object Notation (JSON) string into an object.
 * Supports parsing of big integers in a custom format (strings with digits and
 * "n" at the end) to BigInt values.
 * @param {string} text A valid JSON string.
 * @param {Reviver} reviver A function that transforms the results. This
 *   function is called for each member of the object.
 *   If a member contains nested objects, the nested objects are transformed
 *   before the parent object is.
 * @throws {SyntaxError} If `text` is not valid JSON.
 */
export const JSONParse: (text: string, reviver?: (this: any, key: string, value: any) => any) => any;
/**
 * @param {Object} [options]
 * @param {boolean} [options.useContextSource=false] - Whether to use the
 *   implementation that relies on JSON.parse's context.source feature, which is
 *   faster but not universally supported. Falling back to the classic
 *   implementation if context.source is not supported, regardless of the value
 *   of this option.
 * @param {typeof JSON.parse} [options.JSONParse=JSON.parse] - The JSON.parse function to
 *   use in the implementation. If not provided, the built-in JSON.parse will be
 *   used.
 * @returns {typeof JSON.parse} JSON.parse function with BigInt support, based
 *   on the provided options.
 */
export function JSONParseFactory(options?: {
    useContextSource?: boolean;
    JSONParse?: typeof JSON.parse;
}): typeof JSON.parse;
/**
 * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
 * Supports serialization of BigInt values to a custom format (strings with
 * digits and "n" at the end) in a JSON string.
 *
 * @param {*} value - The value to convert to a JSON string.
 * @param {(Replacer|Array<string>|null)} [replacer] - A function that alters
 *   the behavior of the stringification process, or an array of strings to
 *   indicate properties to exclude.
 * @param {(string|number)} [space] - A string or number to specify indentation
 *   or pretty-printing.
 * @returns {string} The JSON string representation.
 */
export const JSONStringify: {
    (value: any, replacer?: (this: any, key: string, value: any) => any, space?: string | number): string;
    (value: any, replacer?: (number | string)[] | null, space?: string | number): string;
};
/**
 *
 * @param {Object} [options]
 * @param {boolean} [options.useRawJSON=false] - Whether to use the
 *   implementation that relies on JSON.stringify's JSON.rawJSON feature, which
 *   is faster but not universally supported. Falling back to the replacer-based
 *   implementation if JSON.rawJSON is not supported, regardless of the value of
 *   this option.
 * @param {typeof JSON.stringify} [options.JSONStringify] - The JSON.stringify
 *   function to use in the implementation. If not provided, the built-in
 *   JSON.stringify will be used.
 * @returns {typeof JSON.stringify} JSON.stringify function with BigInt support,
 *   based on the provided options.
 */
export function JSONStringifyFactory(options?: {
    useRawJSON?: boolean;
    JSONStringify?: typeof JSON.stringify;
}): typeof JSON.stringify;
