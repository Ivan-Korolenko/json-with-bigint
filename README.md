# JSON with BigInt

JS library that allows you to easily serialize and deserialize data with BigInt values

## Why would I need JSON-with-BigInt?

3 reasons:

1. You need to convert some data to/from JSON and it includes BigInt values
2. Native JSON.stringify() and JSON.parse() methods in JS can't work with BigInt
3. Other libraries and pieces of code that you'll find can't solve this problem while supporting consistent round-trip operations (meaning, you will not get the same BigInt values if you serialize and then deserialize them)

## Good things about JSON-with-BigInt

✔️ Supports consistent round-trip operations with JSON.

```
JSONParse(JSONStringify(9007199254740991n)) === 9007199254740991n // true
```

✔️ Can be used in a TypeScript project (.d.ts file included)

✔️ Size: 164 bytes (minified and gzipped)

✔️ No dependencies
