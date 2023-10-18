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
    v.name = `${v["Last-Name"]}, ${v["First-Name"]}`;
    if (v["Middle-Name"]) {
      v.name = `${v.name} ${v["Middle-Name"]}`;
    }
    delete v["Last-Name"];
    delete v["First-Name"];
    delete v["Middle-Name"];

    if (v["Board-Action-Indicator"] === "N") {
      keysToDelete.push(k);
    }

    v.licenseUrl = `/HealthCareProviders/LicenseVerification?LicInd=${v["lic_id"]}&ProCde=${v["pro_cde"]}`;
    delete v["lic_id"];
    delete v["pro_cde"];

    v.address = v["Practice-Location-Address-Line1"];
    delete v["Practice-Location-Address-Line1"];
    v.city = v["Practice-Location-Address-City"];
    delete v["Practice-Location-Address-City"];
    v.zip = v["Practice-Location-Address-ZIPcode"];
    delete v["Practice-Location-Address-ZIPcode"];
    v.state = v["Practice-Location-Address-State"];
    delete v["Practice-Location-Address-State"];
    v.county = v["County-Description"];
    delete v["County-Description"];
    // Number code
    delete v["County"];

    v.licenseStatus = v["License-Status-Description"];
    delete v["License-Status-Description"];
    // Map to california/common versions
    v.licenseStatus =
      {
        CLEAR: "license renewed & current",
        REVOKED: "license revoked",
        DECEASED: "licensee deceased",
      }[v.licenseStatus as string] ?? v.licenseStatus;
  }

  for (let k of keysToDelete) {
    delete shallowProfiles[k];
  }

  for (let [, v] of Object.entries<any>(deepProfiles)) {
    for (let i = 0; i < (v.actions?.length ?? 0); i++) {
      if (v.actions[i].documentId) {
        v.actions[
          i
        ].url = `https://mqa-internet.doh.state.fl.us/MQASearchServices/Document?id=${v.actions[i].documentId}`;
        delete v.actions[i].documentId;
      }
    }

    if (v.graduationYear) {
      v.graduationYear = Number(v.graduationYear);
    }
  }

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
