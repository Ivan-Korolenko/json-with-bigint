const intRegex = /^-?\d+$/;
const noiseValue = /^-?\d+n+$/; // Noise - strings that match the custom format before being converted to it
const originalStringify = JSON.stringify;
const originalParse = JSON.parse;
const customFormat = /^-?\d+n$/;

const bigIntsStringify = /([\[:])?"(-?\d+)n"($|([\\n]|\s)*(\s|[\\n])*[,\}\]])/g;
const noiseStringify =
  /([\[:])?("-?\d+n+)n("$|"([\\n]|\s)*(\s|[\\n])*[,\}\]])/g;

const passthroughReplacer = (key, value) => value;
const passthroughReviver = (key, value, context) => value;

/** @typedef {(key: string, value: any, context?: { source: string }) => any} Reviver */
/** @typedef {(key: string, value: any, context: { source: string } | undefined, reviver: Reviver) => any } ExtendedReviver */

/**
 * Function to serialize value to a JSON string.
 * Converts BigInt values to a custom format (strings with digits and "n" at the end) and then converts them to proper big integers in a JSON string.
 * @param {*} value - The value to convert to a JSON string.
 * @param {(Function|Array<string>|null)} [replacer] - A function that alters the behavior of the stringification process, or an array of strings to indicate properties to exclude.
 * @param {(string|number)} [space] - A string or number to specify indentation or pretty-printing.
 * @returns {string} The JSON string representation.
 */
const JSONStringify = (value, replacer, space) => {
  if ("rawJSON" in JSON) {
    return originalStringify(
      value,
      (key, value) => {
        if (typeof value === "bigint") return JSON.rawJSON(value.toString());

        if (typeof replacer === "function") return replacer(key, value);

        if (Array.isArray(replacer) && replacer.includes(key)) return value;

        return value;
      },
      space,
    );
  }

  if (!value) return originalStringify(value, replacer, space);

  if (Array.isArray(replacer)) {
    const _replacerArray = replacer;
    replacer = (key, value) => (_replacerArray.includes(key) ? value : undefined);
  } else if (typeof replacer !== "function") {
    replacer = passthroughReplacer;
  }

  const convertedToCustomJSON = originalStringify(
    value,
    (key, value) => {
      switch (typeof value) {
        case "string": {
          return noiseValue.test(value) ? value + "n" : value; // Mark noise values with additional "n" to offset the deletion of one "n" during the processing
        }
        case "bigint":
          return value.toString() + "n";
        default:
          return replacer(key, value);
      }
    },
    space,
  );
  const processedJSON = convertedToCustomJSON.replace(
    bigIntsStringify,
    "$1$2$3",
  ); // Delete one "n" off the end of every BigInt value
  const denoisedJSON = processedJSON.replace(noiseStringify, "$1$2$3"); // Remove one "n" off the end of every noisy string

  return denoisedJSON;
};

/**
 * Support for JSON.parse's context.source feature detection.
 * @type {boolean}
 */
const contextSourceSupported = (() =>
  JSON.parse("1", (_, __, context) => !!context && context.source === "1"))();

/**
 * Convert marked big numbers to BigInt
 * @type {ExtendedReviver}
 */
const convertMarkedBigIntsReviver = (key, value, context, userReviver) => {
  const isCustomFormatBigInt =
    typeof value === "string" && customFormat.test(value);
  if (isCustomFormatBigInt) return BigInt(value.slice(0, -1));

  const isNoiseValue = typeof value === "string" && noiseValue.test(value);
  if (isNoiseValue) return value.slice(0, -1);

  if (typeof userReviver !== "function") return value;
  return userReviver(key, value, context);
};

/**
 * Wether a value is a big number that should be converted to BigInt.
 *
 * @param {number} value 
 * @returns {value is number}
 */
function isBigNumber(value) {
  return (
    (value > Number.MAX_SAFE_INTEGER || value < Number.MIN_SAFE_INTEGER)
  );
}

/**
 * Faster (2x) and simpler function to parse JSON.
 * Based on JSON.parse's context.source feature, which is not universally available now.
 * Does not support the legacy custom format, used in the first version of this library.
 */
const JSONParseWithContext = (text, reviver = passthroughReviver) => {
  if (!text) return originalParse(text, reviver);
  return JSON.parse(text, (key, value, context) => {
      return (context && intRegex.test(context.source) && isBigNumber(value))
        ? BigInt(context.source)
        : reviver(key, value, context);
    }
  );
};

const MAX_INT = Number.MAX_SAFE_INTEGER.toString();
const MAX_DIGITS = MAX_INT.length;
const stringsOrLargeNumbers =
  /"(?:\\.|[^"])*"|-?(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?[0-9]+)?/g;
const noiseValueWithQuotes = /^"-?\d+n+"$/; // Noise - strings that match the custom format before being converted to it

/**
 * Function to parse JSON.
 * If JSON has number values greater than Number.MAX_SAFE_INTEGER, we convert those values to a custom format, then parse them to BigInt values.
 * Other types of values are not affected and parsed as native JSON.parse() would parse them.
 */
const JSONParseClassic = (text, reviver) => {
  if (!text) return originalParse(text, reviver);

  // Find and mark big numbers with "n"
  const serializedData = text.replace(
    stringsOrLargeNumbers,
    (text, digits, fractional, exponential) => {
      const isString = text[0] === '"';
      const isNoise = isString && noiseValueWithQuotes.test(text);

      if (isNoise) return text.substring(0, text.length - 1) + 'n"'; // Mark noise values with additional "n" to offset the deletion of one "n" during the processing

      const isFractionalOrExponential = fractional || exponential;
      const isLessThanMaxSafeInt =
        digits &&
        (digits.length < MAX_DIGITS ||
          (digits.length === MAX_DIGITS && digits <= MAX_INT)); // With a fixed number of digits, we can correctly use lexicographical comparison to do a numeric comparison

      if (isString || isFractionalOrExponential || isLessThanMaxSafeInt)
        return text;

      return '"' + text + 'n"';
    },
  );

  return originalParse(serializedData, (key, value, context) =>
    convertMarkedBigIntsReviver(key, value, context, reviver),
  );
};

const JSONParse = contextSourceSupported ? JSONParseWithContext : JSONParseClassic;

module.exports = { JSONStringify, JSONParse };
