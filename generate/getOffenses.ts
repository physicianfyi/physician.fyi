/**
 * Get offenses of disciplinary actions
 * Maps offense to number to shorten URL via index and doesn't remap existing ones on subsequent runs
 */

import fs from "fs";

(async () => {
  const data = JSON.parse(fs.readFileSync("data/read.json", "utf8"));

  let existingTypes = { results: [] };
  try {
    existingTypes = JSON.parse(fs.readFileSync("data/offenses.json", "utf8"));
  } catch (e) {}

  const offenses: any = existingTypes.results;
  // Store counts separately just to make sure ordering doesn't get changed during serialization...
  const counts: any = {};
  for (let r of Object.keys(data.results)) {
    for (let offense of data.results[r]) {
      if (!offenses.includes(offense)) {
        offenses.push(offense);
      }
      counts[offense] = (counts[offense] ?? 0) + 1;
    }
  }

  const json = {
    lastRun: new Date(),
    numResults: offenses.length,
    results: offenses,
    counts,
  };
  fs.writeFile("data/offenses.json", JSON.stringify(json), (error) => {
    if (error) throw error;
  });
})();
