export const JSONStringify = (data) =>
  JSON.stringify(data, (_, value) =>
    typeof value === "bigint" ? value.toString() + "n" : value
  );

export const JSONParse = (serializedData) =>
  JSON.parse(serializedData, (_, value) =>
    typeof value === "string" && value.match(/^\d+n$/)
      ? BigInt(value.substring(0, value.length - 1))
      : value
  );
