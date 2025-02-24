// ------ Performance tests ------
const { performance } = require("perf_hooks");
const { JSONParse, JSONStringify } = require("../json-with-bigint.cjs");

const fs = require("fs");

const measureExecTime = (fn) => {
  const startTime = performance.now();

  fn();

  const endTime = performance.now();

  console.log("Time: ", endTime - startTime);
};

const performanceTest1 = fs.readFileSync("__tests__/performance.json", "utf8");

measureExecTime(() => {
  console.log("___________");
  console.log("Performance test 1. One-way");
  JSONParse(performanceTest1);
});

measureExecTime(() => {
  console.log("___________");
  console.log("Performance test 1. Round-trip");
  JSONStringify(JSONParse(performanceTest1));
});
