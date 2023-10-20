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

    v.licenseIssuedAt = v["Original-Date"];
    delete v["Original-Date"];

    v.licenseType = v["Profession-Name"].toLowerCase();
    delete v["Profession-Name"];

    if (v["Board-Action-Indicator"] === "N") {
      keysToDelete.push(k);
    }

    v.licenseUrl = `/HealthCareProviders/LicenseVerification?LicInd=${v["lic_id"]}&ProCde=${v["pro_cde"]}`;
    delete v["lic_id"];
    delete v["pro_cde"];

    v.address = v["Practice-Location-Address-Line1"];
    delete v["Practice-Location-Address-Line1"];
    if (v["Practice-Location-Address-line2"]) {
      v.address2 = v["Practice-Location-Address-line2"];
      delete v["Practice-Location-Address-line2"];
    }
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

    if (
      [
        "none",
        "NOT PRACTICING",
        "*** CONFIDENTIAL ***",
        "*** NOT AVAILABLE ***",
      ].includes(v.address)
    ) {
      delete v.address;
    }
    if (
      ["*** CONFIDENTIAL ***", "*** NOT AVAILABLE ***"].includes(v.address2)
    ) {
      delete v.address2;
    }
    if (
      ["NONE", "*** CONFIDENTIAL ***", "*** NOT AVAILABLE ***"].includes(v.city)
    ) {
      delete v.city;
    }
    if (
      [
        "UNKNOWN",
        "Out of State",
        "Foreign",
        "OUT STATE",
        "*** CONFIDENTIAL ***",
      ].includes(v.county)
    ) {
      delete v.county;
    }
    if (["00000", "*****"].includes(v.zip)) {
      delete v.zip;
    }
    if (["**"].includes(v.state)) {
      delete v.state;
    }

    if (!v.address && !v.city && !v.zip && !v.state && !v.county) {
      v.address = v["Mailing-Address-Line1"];
      if (v["Mailing-Address-line2"]) {
        v.address2 = v["Mailing-Address-line2"];
      }
      v.city = v["Mailing-Address-City"];
      v.zip = v["Mailing-Address-ZIPcode"];
      v.state = v["Mailing-Address-State"];
    }
    delete v["Mailing-Address-Line1"];
    delete v["Mailing-Address-line2"];
    delete v["Mailing-Address-City"];
    delete v["Mailing-Address-ZIPcode"];
    delete v["Mailing-Address-State"];
    // Do the cleaning again for any bad values from mailing address
    if (
      [
        "none",
        "NOT PRACTICING",
        "*** CONFIDENTIAL ***",
        "*** NOT AVAILABLE ***",
      ].includes(v.address)
    ) {
      delete v.address;
    }
    if (
      ["*** CONFIDENTIAL ***", "*** NOT AVAILABLE ***"].includes(v.address2)
    ) {
      delete v.address2;
    }
    if (
      ["NONE", "*** CONFIDENTIAL ***", "*** NOT AVAILABLE ***"].includes(v.city)
    ) {
      delete v.city;
    }
    // Don't need to check county again since not in mailing address
    if (["00000", "*****"].includes(v.zip)) {
      delete v.zip;
    }
    if (["**"].includes(v.state)) {
      delete v.state;
    }

    v.licenseStatus = v["License-Status-Description"];
    delete v["License-Status-Description"];
    // Map to california/common versions
    v.licenseStatus = (
      {
        CLEAR: "license renewed & current",
        REVOKED: "license revoked",
        DECEASED: "licensee deceased",
        "VOL RELINQ": "license surrendered",
        "NULL AND VOID": "license canceled",
        "DISCP RELINQ": "license revoked",
        RETIRED: "license surrendered",
        "VOLUN WITHDRAW": "license surrendered",
        "EMERG SUSPENS": "emergency suspension",
        SUSPENDED: "license canceled",
      }[v.licenseStatus as string] ?? v.licenseStatus
    ).toLowerCase();
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

      v.actions[i].actionType = (
        {
          "Administrative Complaint Filed": "ADMINISTRATIVE DISCIPLINE",
        }[v.actions[i].actionType as string] ?? v.actions[i].actionType
      ).toLowerCase();
    }

    if (v.graduationYear) {
      if (v.graduationYear === "0001") {
        delete v.graduationYear;
      } else {
        v.graduationYear = Number(v.graduationYear);
      }
    }

    if (v.school) {
      v.school = v.school.toLowerCase();
    }

    const specialties = v.specialties?.map((s: any) =>
      s.certification.replace(/^.*-/, "").trim()
    );
    if (specialties) {
      v.specialties = specialties;
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
