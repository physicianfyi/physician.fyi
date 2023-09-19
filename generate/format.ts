/**
 * Format data
 */

import fs from "fs";

const group = function (xs: any) {
  return xs.reduce(function (rv: any, x: any) {
    let key;
    if (
      !x["License Number"] ||
      x["License Number"] === "00" ||
      x["License Number"] === " "
    ) {
      // There are 9 records with no names at all
      if (!x["Last Name"]) {
        return rv;
      }
      // Don't want to list unlicensed ones as same doctor in results
      key = `UNLICENSED-${x["First Name"]}-${x["Middle Name"]}-${x["Last Name"]}`;
    } else {
      key = `${x["License Type"]}-${x["License Number"]}`;
    }

    (rv[key] = rv[key] ?? []).push(x);
    return rv;
  }, {});
};

(async () => {
  const data = JSON.parse(
    fs.readFileSync("data/ca-with-offenses.json", "utf8")
  );

  const groupedData = group(data.results);
  const json = {
    lastRun: new Date(),
    numResults: Object.keys(groupedData).length,
    results: groupedData,
  };
  fs.writeFile("data/ca-grouped.json", JSON.stringify(json), (error) => {
    if (error) throw error;
  });
})();
