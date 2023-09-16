/**
 * Get types of disciplines
 */

import fs from "fs";

(async () => {
  const data = JSON.parse(fs.readFileSync("data/ca.json", "utf8"));

  const types = new Set();
  for (let r of data.results) {
    // Some don't have Type
    if (r["Type"]) {
      types.add(r["Type"]);
    }
  }

  // TODO Map type to number to shorten URL, and make script not remap existing ones on subsequent runs

  const json = {
    lastRun: new Date(),
    numResults: types.size,
    results: [...types],
  };
  fs.writeFile("data/types.json", JSON.stringify(json), (error) => {
    if (error) throw error;
  });
})();
