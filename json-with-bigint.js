const kAutoDetect = Symbol("auto-detect");

const intRegex = /^-?\d+$/;
const noiseValue = /^-?\d+n+$/; // Noise - strings that match the custom format before being converted to it
const originalStringify = JSON.stringify;
const originalParse = JSON.parse;
const customFormat = /^-?\d+n$/;

const bigIntsStringify = /([\[:])?"(-?\d+)n"($|([\\n]|\s)*(\s|[\\n])*[,\}\]])/g;
const noiseStringify =
  /([\[:])?("-?\d+n+)n("$|"([\\n]|\s)*(\s|[\\n])*[,\}\]])/g;

const passthroughReplacer = (_key, value) => value;
const passthroughReviver = (_key, value, _context) => value;

/** @typedef {(this: any, key: string, value: any) => any} Replacer */
/** @typedef {(key: string, value: any, context?: { source: string }) => any} Reviver */
/** @typedef {(key: string, value: any, context: { source: string } | undefined, reviver: Reviver) => any } ExtendedReviver */

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
const JSONStringifyClassic = (value, replacer, space) => {
  if (!value) return originalStringify(value, replacer, space);

  if (Array.isArray(replacer)) {
    const _replacerArray = replacer;
    replacer = (key, value) =>
      _replacerArray.includes(key) ? value : undefined;
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
const JSONStringifyRawJSON = (value, replacer, space) => {
  if (Array.isArray(replacer)) {
    const _replacerArray = replacer;
    replacer = (key, value) =>
      _replacerArray.includes(key) ? value : undefined;
  } else if (typeof replacer !== "function") {
    replacer = passthroughReplacer;
  }

  return originalStringify(
    value,
    (key, value) => {
      if (typeof value === "bigint") return JSON.rawJSON(value.toString());

      if (typeof replacer === "function") return replacer(key, value);

      return replacer(key, value);
    },
    space,
  );
};

/**
 * Detect if provided for JSON.parse supports the context.source feature.
 * @param {typeof JSON.parse} JSONParse - The JSON.parse function to test.
 * @returns {boolean}
 */
const isContextSourceSupported = (JSONParse) =>
  JSONParse("1", (_, __, context) => !!context && context.source === "1");

/**
 * Support for JSON.stringify's JSON.rawJSON feature detection.
 * @param {typeof JSON} JSON - The JSON object to test.
 * @returns {boolean}
 */
const isRawJSONSupported = (JSON) => "rawJSON" in JSON;

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
 * Whether a value is a big number that should be converted to BigInt.
 *
 * @param {number} value
 * @returns {value is number}
 */
const isBigNumber = (value) => {
  return value > Number.MAX_SAFE_INTEGER || value < Number.MIN_SAFE_INTEGER;
}

/**
 * Faster (2x) and simpler function to parse JSON.
 * Based on JSON.parse's context.source feature, which is not universally
 * available now.
 * Does not support the legacy custom format, used in the first version of this
 * library.
 */
const JSONParseWithContext = (JSONParse) => (text, reviver = passthroughReviver) => {
  if (!text) return originalParse(text, reviver);

  return JSONParse(text, (key, value, context) => {
    return context && intRegex.test(context.source) && isBigNumber(value)
      ? BigInt(context.source)
      : reviver(key, value, context);
  });
};

const MAX_INT = Number.MAX_SAFE_INTEGER.toString();
const MAX_DIGITS = MAX_INT.length;
const stringsOrLargeNumbers =
  /"(?:\\.|[^"])*"|-?(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?[0-9]+)?/g;
const noiseValueWithQuotes = /^"-?\d+n+"$/; // Noise - strings that match the custom format before being converted to it

/**
 * Function to parse JSON.
 * If JSON has number values greater than Number.MAX_SAFE_INTEGER, we convert
 * those values to a custom format, then parse them to BigInt values.
 * Other types of values are not affected and parsed as native JSON.parse()
 * would parse them.
 */
const JSONParseClassic = (JSONParse) => (text, reviver) => {
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

  return JSONParse(serializedData, (key, value, context) =>
    convertMarkedBigIntsReviver(key, value, context, reviver),
  );
};

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
const JSONParseFactory = (options) => {
  if (options === kAutoDetect) {
    const JSONParse = originalParse;
    return (text, reviver, context) => {
      if (isContextSourceSupported(JSONParse)) {
        return JSONParseWithContext(JSONParse)(text, reviver, context);
      } else {
        return JSONParseClassic(JSONParse)(text, reviver, context);
      }
    };
  }

  const JSONParse = options && options.JSONParse ? options.JSONParse : originalParse;
  const useContextSource = options && options.useContextSource;

  if (useContextSource === true) {
    if (!isContextSourceSupported(JSONParse)) {
      throw new TypeError(
        "The context.source feature is not supported by the provided JSON.parse implementation, which is required for the context.source-based implementation. Please provide a compatible JSON.parse or set useContextSource to false.",
      );
    }
    return JSONParseWithContext(JSONParse);
  }
  return JSONParseClassic(JSONParse);
};

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
const JSONParse = JSONParseFactory(kAutoDetect);

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
const JSONStringifyFactory = (options) => {
  if (options === kAutoDetect) {
    const JSONStringify = originalStringify;
    return (value, replacer, space) => {
      if (isRawJSONSupported(JSON)) {
        return JSONStringifyRawJSON(value, replacer, space);
      } else {
        return JSONStringifyClassic(value, replacer, space);
      }
    }
  }

  const JSONStringify = options && options.JSONStringify ? options.JSONStringify : originalStringify;
  const useRawJSON = options && options.useRawJSON;

  if (useRawJSON === true) {
    if (!isRawJSONSupported(JSON)) {
      throw new TypeError(
        "The JSON.rawJSON feature is not supported by the provided JSON.stringify implementation, which is required for the JSON.rawJSON-based implementation. Please provide a compatible JSON.stringify or set useRawJSON to false.",
      );
    }
    return JSONStringifyRawJSON(JSONStringify);
  }
  return JSONStringifyClassic(JSONStringify);
};

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
const JSONStringify = JSONStringifyFactory(kAutoDetect);

export default JSONParse;
export { isContextSourceSupported };
export { isRawJSONSupported };
export { JSONParse };
export { JSONParseFactory };
export { JSONStringify };
export { JSONStringifyFactory };
