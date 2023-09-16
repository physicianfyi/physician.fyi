/**
 * Get types of licenses
 * Maps type to number to shorten URL via index and doesn't remap existing ones on subsequent runs
 */

import fs from "fs";

(async () => {
  const data = JSON.parse(fs.readFileSync("data/ca.json", "utf8"));

  const existingTypes = JSON.parse(
    fs.readFileSync("data/license-types.json", "utf8")
  );

  const types = existingTypes.results;
  // Store counts separately just to make sure ordering doesn't get changed during serialization...
  const counts: any = {};
  for (let r of data.results) {
    // Some don't have Type, but still want to select disciplined without license
    const type =
      r["License Type"] === "\u00A0"
        ? null
        : !r["License Type"]
        ? null
        : r["License Type"];
    if (!types.includes(type)) {
      types.push(type);
    }

    counts[type] = (counts[type] ?? 0) + 1;
  }

  const json = {
    lastRun: new Date(),
    numResults: types.length,
    results: types,
    counts,
  };
  fs.writeFile("data/license-types.json", JSON.stringify(json), (error) => {
    if (error) throw error;
  });
})();
