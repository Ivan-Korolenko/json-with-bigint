import fs from "fs";

const esmSource = fs.readFileSync("./json-with-bigint.js", "utf-8");

const cjsSource = "'use strict';\n\n" + esmSource.replace(
  /export\s+{([^}]+)};/g,
  "module.exports = {$1};",
);

fs.writeFileSync("./json-with-bigint.cjs", cjsSource, "utf-8");