/**
 * Format data
 */

import fs from "fs";

const group = function (xs: any) {
  return xs.reduce(function (rv: any, x: any) {
    // TODO Figure out how to handle unlicensed ones like trainees
    if (
      !x["License Number"] ||
      x["License Number"] === "00" ||
      x["License Number"] === " "
    ) {
      return rv;
    }

    const key = `${x["License Type"]}-${x["License Number"]}`;
    (rv[key] = rv[key] ?? []).push(x);
    return rv;
  }, {});
};

(async () => {
  const data = JSON.parse(fs.readFileSync("data/ca.json", "utf8"));

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
