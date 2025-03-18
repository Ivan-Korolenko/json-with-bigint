const noiseValue = /^-?\d+n+$/; // Noise - strings that match the custom format before being converted to it

/* 
  Function to serialize data to a JSON string.
  Converts BigInt values to a custom format (strings with digits and "n" at the end) and then converts them to proper big integers in a JSON string.
*/
const JSONStringify = (data, space) => {
  if ("rawJSON" in JSON) {
    return JSON.stringify(
      data,
      (_, value) => {
        return typeof value === "bigint" ? JSON.rawJSON(value.toString()) : value
      },
      space
    );
  }

  if (!data) return JSON.stringify(data);

  const bigInts = /([\[:])?"(-?\d+)n"($|[,\}\]])/g;
  const noise = /([\[:])?("-?\d+n+)n("$|"[,\}\]])/g;
  const convertedToCustomJSON = JSON.stringify(
    data,
    (_, value) => {
      const isNoise =
        typeof value === "string" && Boolean(value.match(noiseValue));

      if (isNoise) return value.toString() + "n"; // Mark noise values with additional "n" to offset the deletion of one "n" during the processing

      return typeof value === "bigint" ? value.toString() + "n" : value;
    },
    space
  );
  const processedJSON = convertedToCustomJSON.replace(bigInts, "$1$2$3"); // Delete one "n" off the end of every BigInt value
  const denoisedJSON = processedJSON.replace(noise, "$1$2$3"); // Remove one "n" off the end of every noisy string

  return denoisedJSON;
};

/* 
  Function to parse JSON.
  If JSON has number values greater than Number.MAX_SAFE_INTEGER, we convert those values to a custom format, then parse them to BigInt values.
  Other types of values are not affected and parsed as native JSON.parse() would parse them.
*/
const JSONParse = (json) => {
  if (!json) return JSON.parse(json);

  const MAX_INT = Number.MAX_SAFE_INTEGER.toString();
  const MAX_DIGITS = MAX_INT.length;
  const stringsOrLargeNumbers =
    /"(?:\\.|[^"])*"|-?(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?[0-9]+)?/g;
  const noiseValueWithQuotes = /^"-?\d+n+"$/; // Noise - strings that match the custom format before being converted to it
  const customFormat = /^-?\d+n$/;

  // Find and mark big numbers with "n"
  const serializedData = json.replace(
    stringsOrLargeNumbers,
    (text, digits, fractional, exponential) => {
      const isString = text[0] === '"';
      const isNoise = isString && Boolean(text.match(noiseValueWithQuotes));

      if (isNoise) return text.substring(0, text.length - 1) + 'n"'; // Mark noise values with additional "n" to offset the deletion of one "n" during the processing

      const isFractionalOrExponential = fractional || exponential;
      const isLessThanMaxSafeInt =
        digits &&
        (digits.length < MAX_DIGITS ||
          (digits.length === MAX_DIGITS && digits <= MAX_INT)); // With a fixed number of digits, we can correctly use lexicographical comparison to do a numeric comparison

      if (isString || isFractionalOrExponential || isLessThanMaxSafeInt)
        return text;

      return '"' + text + 'n"';
    }
  );

  // Convert marked big numbers to BigInt
  return JSON.parse(serializedData, (_, value) => {
    const isCustomFormatBigInt =
      typeof value === "string" && Boolean(value.match(customFormat));

    if (isCustomFormatBigInt)
      return BigInt(value.substring(0, value.length - 1));

    const isNoiseValue =
      typeof value === "string" && Boolean(value.match(noiseValue));

    if (isNoiseValue) return value.substring(0, value.length - 1); // Remove one "n" off the end of the noisy string

    return value;
  });
};

module.exports = { JSONStringify, JSONParse };
