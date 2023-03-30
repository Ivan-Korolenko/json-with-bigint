/* 
  Function to serialize data to JSON string.
  Converts all BigInt values to strings with "n" character at the end.
*/
export const JSONStringify = (data) =>
  JSON.stringify(data, (_, value) =>
    typeof value === "bigint" ? value.toString() + "n" : value
  );

/* 
  Function to parse JSON.
  If JSON has values in our custom format BigInt (strings with "n" character at the end), we just parse them to BigInt values.
  If JSON has big number values, but not in our custom format, we copy it, and in a copy we convert those values to our custom format, 
  then parse them to BigInt values.
  Other values (not big numbers and not our custom format BigInt values) are not affected and parsed as native JSON.parse() would parse them.
*/
export const JSONParse = (json) => {
  /*
    Big numbers are found and marked using Regex with this condition:
    Number's length is bigger than 16 || Number's length is 16 and any numerical digit of the number is greater than that of the Number.MAX_SAFE_INTEGER
  */
  const numbersBiggerThanMaxInt =
    /([\[:])?(\d{17,}|(?:[9](?:[1-9]07199254740991|0[1-9]7199254740991|00[8-9]199254740991|007[2-9]99254740991|007199[3-9]54740991|0071992[6-9]4740991|00719925[5-9]740991|007199254[8-9]40991|0071992547[5-9]0991|00719925474[1-9]991|00719925474099[2-9])))([,\}\]])/g;
  const serializedData = json.replace(numbersBiggerThanMaxInt, '$1"$2n"$3');

  return JSON.parse(serializedData, (_, value) => {
    const isCustomFormatBigInt =
      typeof value === "string" && value.match(/^\d+n$/);

    if (isCustomFormatBigInt)
      return BigInt(value.substring(0, value.length - 1));

    return value;
  });
};
