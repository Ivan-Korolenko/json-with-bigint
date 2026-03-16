"use strict";

// ------ Unit tests ------

const { deepStrictEqual } = require("assert");
const { isContextSourceSupported, JSONStringify, JSONParseFactory } = require("../json-with-bigint.cjs");

const test1JSON = `{"zero":9007199254740998,"one":-42,"two":-9007199254740998,"test":["He was\\":[-23432432432434324324324324]",111,9007199254740998,{"test2":-9007199254740998}],"test3":["He was:[-23432432432434324324324324]",111,9007199254740998,{"test2":-9007199254740998,"float":1.9007199254740998,"float2":0.1,"float3":2.9007199254740996,"int":1,"int2":3243243432432434324324324}],"float4":[1.9007199254740998,1111111111111111111111111111111111,0.1,1,54354654654654654654656546546546546]}`;
const test1Obj = {
  zero: 9007199254740998n,
  one: -42,
  two: -9007199254740998n,
  test: [
    'He was":[-23432432432434324324324324]',
    111,
    9007199254740998n,
    { test2: -9007199254740998n },
  ],
  test3: [
    "He was:[-23432432432434324324324324]",
    111,
    9007199254740998n,
    {
      test2: -9007199254740998n,
      float: 1.9007199254740998,
      float2: 0.1,
      float3: 2.9007199254740996,
      int: 1,
      int2: 3243243432432434324324324n,
    },
  ],
  float4: [
    1.9007199254740998,
    1111111111111111111111111111111111n,
    0.1,
    1,
    54354654654654654654656546546546546n,
  ],
};

const test2JSON = `{
  "test": [
      {
          "ID": 1035342667379599058,
          "Timestamp": "2022-09-13 22:21:25",
          "Contents": "broken example message",
          "Contents2": "broken example 1035342667379599058 message",
          "Contents3": "broken example [1035342667379599058, 1035342667379599058] message",
          "Attachments": "",
          "BreakingValue": 54354654654654654654656546546546546
      },
      1035342667379599058,
      -1.1035342667379599058,
      1035342667379599058
  ],
  "test2": {
          "1035342667379599058": 1035342667379599058
  }
}`;
// Special case, because native JSON.parse strips \n and whitespaces.
// So technically, a true round-trip operation (including all spaces, etc.) is not possible in the case of pretty JSON without writing your own full JSON.parse implementation for this particular case.
// In practice, though, it shouldn't cause any problems, because data will work fine even in that case, and if the backend expects a prettified JSON, you can just prettify it before sending it.
const test2TersedJSON = `{"test":[{"ID":1035342667379599058,"Timestamp":"2022-09-13 22:21:25","Contents":"broken example message","Contents2":"broken example 1035342667379599058 message","Contents3":"broken example [1035342667379599058, 1035342667379599058] message","Attachments":"","BreakingValue":54354654654654654654656546546546546},1035342667379599058,-1.10353426673796,1035342667379599058],"test2":{"1035342667379599058":1035342667379599058}}`;
const test2Obj = {
  test: [
    {
      ID: 1035342667379599058n,
      Timestamp: "2022-09-13 22:21:25",
      Contents: "broken example message",
      Contents2: "broken example 1035342667379599058 message",
      Contents3:
        "broken example [1035342667379599058, 1035342667379599058] message",
      Attachments: "",
      BreakingValue: 54354654654654654654656546546546546n,
    },
    1035342667379599058n,
    -1.10353426673796,
    1035342667379599058n,
  ],
  test2: { "1035342667379599058": 1035342667379599058n },
};

const test3JSON = `{"items":[{"message":"some text 17365091955960356025, some text"}]}`;
const test3Obj = {
  items: [{ message: "some text 17365091955960356025, some text" }],
};

const test4JSON = `9007199254740998`;
const test4Obj = 9007199254740998n;

const test5JSON = `[9007199254740998,[9007199254740998],9007199254740998]`;
const test5Obj = [9007199254740998n, [9007199254740998n], 9007199254740998n];

const test6JSON = `[9007199254740998]`;
const test6Obj = [9007199254740998n];

const test7JSON = `["0a","1b","9n","9nn",90071992547409981111,"90071992547409981111.5n"]`;
const test7Obj = [
  "0a",
  "1b",
  "9n",
  "9nn",
  90071992547409981111n,
  "90071992547409981111.5n",
];

const test8Obj = { uid: BigInt("1308537228663099396") };
const test8JSON = '{\n  "uid": 1308537228663099396\n}';

const runTests = (JSONParse) => {
  deepStrictEqual(JSONParse(test1JSON), test1Obj);
  console.log("1 test passed");
  deepStrictEqual(JSONStringify(JSONParse(test1JSON)), test1JSON);
  console.log("1 test round-trip passed");

  deepStrictEqual(JSONParse(test2JSON), test2Obj);
  console.log("2 test passed");
  deepStrictEqual(JSONStringify(JSONParse(test2JSON)), test2TersedJSON);
  console.log("2 test round-trip passed");

  deepStrictEqual(JSONParse(test3JSON), test3Obj);
  console.log("3 test passed");
  deepStrictEqual(JSONStringify(JSONParse(test3JSON)), test3JSON);
  console.log("3 test round-trip passed");

  deepStrictEqual(JSONParse(test4JSON), test4Obj);
  console.log("4 test passed");
  deepStrictEqual(JSONStringify(JSONParse(test4JSON)), test4JSON);
  console.log("4 test round-trip passed");

  deepStrictEqual(JSONParse(test5JSON), test5Obj);
  console.log("5 test passed");
  deepStrictEqual(JSONStringify(JSONParse(test5JSON)), test5JSON);
  console.log("5 test round-trip passed");

  deepStrictEqual(JSONParse(test6JSON), test6Obj);
  console.log("6 test passed");
  deepStrictEqual(JSONStringify(JSONParse(test6JSON)), test6JSON);
  console.log("6 test round-trip passed");

  deepStrictEqual(JSONParse(test7JSON), test7Obj);
  console.log("7 test passed");
  deepStrictEqual(JSONStringify(JSONParse(test7JSON)), test7JSON);
  console.log("7 test round-trip passed");

  deepStrictEqual(JSONStringify(test8Obj, null, 2), test8JSON);
  console.log("8 test passed");
  deepStrictEqual(JSONParse(JSONStringify(test8Obj, null, 2)), test8Obj);
  console.log("8 test round-trip passed");
};

console.log("------ V2 unit tests ------");
try {
  runTests(JSONParseFactory({ useContextSource: true }));
} catch (error) {
  if (isContextSourceSupported(JSON.parse)) {
    throw error; // Re-throw if context.source is supported, because the error is unexpected in that case
  } else {
    console.warn(
      "Context.source is not supported in this environment. Skipping context.source-based implementation tests.",
    );
  }
}

if (!isContextSourceSupported(JSON.parse)) {
  console.log("\n------ Context.source-based implementation error handling test ------");
  try {
    JSONParseFactory({ useContextSource: true })(test1JSON);
    throw new Error("Expected an error to be thrown when using context.source-based implementation in an unsupported environment, but no error was thrown.");
  } catch (error) {
    if (!(error instanceof TypeError && error.message.includes("context.source"))) {
      throw error; // Re-throw if the error is not the expected TypeError about context.source
    }
  }
  console.log("Context.source-based implementation error handling test passed");
}

console.log("\n------ V1 (without context.source) unit tests ------");
runTests(JSONParseFactory({ useContextSource: false }));

if (isContextSourceSupported(JSON.parse)) {
  console.log("\n------ V1 vs V2 consistency tests ------");
  deepStrictEqual(JSONParseFactory({ useContextSource: true })(test1JSON), JSONParseFactory({ useContextSource: false })(test1JSON));
  console.log("1 test passed");
  deepStrictEqual(JSONParseFactory({ useContextSource: true })(test2JSON), JSONParseFactory({ useContextSource: false })(test2JSON));
  console.log("2 test passed");
  deepStrictEqual(JSONParseFactory({ useContextSource: true })(test3JSON), JSONParseFactory({ useContextSource: false })(test3JSON));
  console.log("3 test passed");
  deepStrictEqual(JSONParseFactory({ useContextSource: true })(test4JSON), JSONParseFactory({ useContextSource: false })(test4JSON));
  console.log("4 test passed");
  deepStrictEqual(JSONParseFactory({ useContextSource: true })(test5JSON), JSONParseFactory({ useContextSource: false })(test5JSON));
  console.log("5 test passed");
  deepStrictEqual(JSONParseFactory({ useContextSource: true })(test6JSON), JSONParseFactory({ useContextSource: false })(test6JSON));
  console.log("6 test passed");
  deepStrictEqual(JSONParseFactory({ useContextSource: true })(test7JSON), JSONParseFactory({ useContextSource: false })(test7JSON));
  console.log("7 test passed");
  deepStrictEqual(JSONParseFactory({ useContextSource: true })(test8JSON), JSONParseFactory({ useContextSource: false })(test8JSON));
  console.log("8 test passed");
}