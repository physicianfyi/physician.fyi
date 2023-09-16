/**
 * Get types of disciplinary actions
 * Maps type to number to shorten URL via index and doesn't remap existing ones on subsequent runs
 */

import fs from "fs";

(async () => {
  const data = JSON.parse(fs.readFileSync("data/ca.json", "utf8"));

  const existingTypes = JSON.parse(fs.readFileSync("data/types.json", "utf8"));

  const types = existingTypes.results;
  // Store counts separately just to make sure ordering doesn't get changed during serialization...
  const counts: any = {};
  for (let r of data.results) {
    // Some don't have Type
    if (r["Type"] && !types.includes(r["Type"])) {
      types.push(r["Type"]);
    }

    if (r["Type"]) {
      counts[r["Type"]] = (counts[r["Type"]] ?? 0) + 1;
    }
  }

  const json = {
    lastRun: new Date(),
    numResults: types.length,
    results: types,
    counts,
  };
  fs.writeFile("data/types.json", JSON.stringify(json), (error) => {
    if (error) throw error;
  });
})();
