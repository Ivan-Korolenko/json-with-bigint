# JSON with BigInt

JS library that allows you to easily serialize and deserialize data with BigInt values

## Why would I need JSON-with-BigInt?

3 reasons:

1. You need to convert some data to/from JSON and it includes BigInt values
2. Native JSON.stringify() and JSON.parse() methods in JS can't work with BigInt
3. Other libraries and pieces of code that you'll find can't solve this problem while supporting consistent round-trip operations (meaning, you will not get the same BigInt values if you serialize and then deserialize them)

## Good things about JSON-with-BigInt

✔️ Supports consistent round-trip operations with JSON

```
JSONParse(JSONStringify(9007199254740991n)) === 9007199254740991n // true
```

✔️ Does not contaminate your global space (unlike monkey-patching solution)

✔️ You don't have to memorize this library's API, you already know it, just skip the dot and that's it

✔️ Can be used in a TypeScript project (.d.ts file included)

✔️ Size: 164 bytes (minified and gzipped)

✔️ No dependencies

## Getting Started

This library has no default export. [Why it's a good thing](https://humanwhocodes.com/blog/2019/01/stop-using-default-exports-javascript-module/)

### NPM

Add this library to your project using NPM

```
npm i json-with-bigint
```

and use it

```
import { JSONParse, JSONStringify } from 'json-with-bigint';

const userData = {
  someBigNumber: 9007199254740991n
};

localStorage.setItem('userData', JSONStringify(userData));

const restoredUserData = JSONParse(localStorage.getItem('userData'));
```

### CDN

Add this code to your HTML

```
<script src="https://cdn.jsdelivr.net/npm/json-with-bigint/json-with-bigint.min.js"></script>
```

and use it

```
<script>
  const userData = {
    someBigNumber: 9007199254740991n
  };

  localStorage.setItem('userData', JSONStringify(userData));

  const restoredUserData = JSONParse(localStorage.getItem('userData'));
</script>
```

### Manually

Download json-with-bigint.min.js from this repository to your project's folder and use it

```
<script src="./json-with-bigint.min.js"></script>
<script>
  const userData = {
    someBigNumber: 9007199254740991n
  };

  localStorage.setItem('userData', JSONStringify(userData));

  const restoredUserData = JSONParse(localStorage.getItem('userData'));
</script>
```

## How to use

`JSONParse` - works just like [native JSON.parse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse), but supports BigInt

`JSONStringify` - works just like [native JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify), but supports BigInt

Examples:

- `JSONParse('{"someBigNumber":9007199254740991n}')`
- `JSONStringify({
someBigNumber: 9007199254740991n
})`
