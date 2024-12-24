/* 
  Function to serialize data to JSON string
  Converts BigInt values to custom format (strings with digits and "n" at the end) and then converts them to proper big integers in JSON string
*/
export const JSONStringify = (data, space) => {
  if (!data) return JSON.stringify(data);

  const bigInts = /([\[:])?"(-?\d+)n"([,\}\]])/g;
  const preliminaryJSON = JSON.stringify(
    data,
    (_, value) => (typeof value === "bigint" ? value.toString() + "n" : value),
    space
  );
  const finalJSON = preliminaryJSON.replace(bigInts, "$1$2$3");

  return finalJSON;
};

/* 
  Function to parse JSON
  If JSON has values presented in a lib's custom format (strings with digits and "n" character at the end), we just parse them to BigInt values (for backward compatibility with previous versions of the lib)
  If JSON has values greater than Number.MAX_SAFE_INTEGER, we convert those values to our custom format, then parse them to BigInt values.
  Other types of values are not affected and parsed as native JSON.parse() would parse them.

  Big numbers are found and marked using a Regular Expression with these conditions:
    
    1. Before the match there is no . and one of the following is present: 
      1.1 ":
      1.2 ":[ 
      1.3 ":[anyNumberOf(anyCharacters) 
      1.4 , with no ":"anyNumberOf(anyCharacters) before it
    All " required in the rule are not escaped. All whitespace and newline characters outside of string values are ignored.
    
    2. The match itself has more than 16 digits OR (16 digits and any digit of the number is greater than that of the Number.MAX_SAFE_INTEGER). And it may have a - sign at the start.
    
    3. After the match one of the following is present:
      3.1 , 
      3.2 } without " after it 
      3.3 ] without " after it
    All whitespace and newline characters outside of string values are ignored.
*/
export const JSONParse = (json) => {
  if (!json) return JSON.parse(json);

  const numbersBiggerThanMaxInt =
    /(?<=[^\\]":\n*\s*[\[]?|[^\\]":\n*\s*\[.*[^\.\d*]\n*\s*|(?<![^\\]"\n*\s*:\n*\s*[^\\]".*),\n*\s*)(-?\d{17,}|-?(?:[9](?:[1-9]07199254740991|0[1-9]7199254740991|00[8-9]199254740991|007[2-9]99254740991|007199[3-9]54740991|0071992[6-9]4740991|00719925[5-9]740991|007199254[8-9]40991|0071992547[5-9]0991|00719925474[1-9]991|00719925474099[2-9])))(?=,|\n*\s*\}[^"]?|\n*\s*\][^"])/g;
  const serializedData = json.replace(numbersBiggerThanMaxInt, `"$1n"`);

  return JSON.parse(serializedData, (_, value) => {
    const isCustomFormatBigInt =
      typeof value === "string" && Boolean(value.match(/^-?\d+n$/));

    if (isCustomFormatBigInt)
      return BigInt(value.substring(0, value.length - 1));

    return value;
  });
};
