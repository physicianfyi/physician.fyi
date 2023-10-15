/**
 * Step 2: Cleans things found after the fact, reformats data to be useful, and merges scrape-deep and scrape-shallow
 */

import fs from "fs";

(async () => {
  const shallowData = JSON.parse(
    fs.readFileSync("data/fl/scrape-shallow.json", "utf8")
  );
  const shallowProfiles = shallowData.profiles;
  const deepData = JSON.parse(
    fs.readFileSync("data/fl/scrape-deep.json", "utf8")
  );
  const deepProfiles = deepData.profiles;

  const keysToDelete = [];
  for (let [k, v] of Object.entries<any>(shallowProfiles)) {
    // For now just using full name
    v.name = `${v["Last-Name"]}, ${v["First-Name"]} ${v["Middle-Name"]}`;
    delete v["Last-Name"];
    delete v["First-Name"];
    delete v["Middle-Name"];

    if (v["Board-Action-Indicator"] === "N") {
      keysToDelete.push(k);
    }
  }

  for (let k of keysToDelete) {
    delete shallowProfiles[k];
  }

  // for (let [, v] of Object.entries<any>(deepProfiles)) {
  //   for (let i = 0; i < (v.actions?.length ?? 0); i++) {
  //   }
  // }

  const profiles = Object.fromEntries(
    Object.entries<any>(shallowProfiles).map(([k, v]) => {
      return [
        k,
        {
          ...shallowProfiles[k],
          ...deepProfiles[k],
        },
      ];
    })
  );

  const json = {
    // Has lastRun dates
    ...shallowData,
    ...deepData,
    cleanLastRun: new Date(),
    numProfiles: Object.keys(profiles).length,
    profiles,
  };

  fs.writeFile("data/fl/clean.json", JSON.stringify(json), (error) => {
    if (error) throw error;
  });
})();
