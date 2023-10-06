import fs from "fs";
import Fuse from "fuse.js";
import { PAGE_SIZE } from "./constants";

/**
 * Select paginated, filtered physicians
 */
export const selectPhysicians = async ({
  page = 0,
  query = "",
  actionTypes = [],
  licenseTypes = [],
  offenses = [],
}: {
  page?: number;
  query?: string;
  actionTypes?: string[];
  licenseTypes?: string[];
  offenses?: string[];
}) => {
  const data = JSON.parse(fs.readFileSync("data/ca/clean.json", "utf8"));

  // TODO Also generate this as a new file like ca-grouped-flat.json
  let results = Object.keys(data.profiles).map((key) => ({
    license: key,
    data: data.profiles[key],
  }));

  if (actionTypes.length) {
    results = results.filter((result) => {
      for (let action of result.data.actions ?? []) {
        if (actionTypes.includes(action.actionType)) {
          return true;
        }
      }
      return false;
    });
  }

  // if (licenseTypes.length) {
  //   results = results.filter((result) => {
  //     for (let d of result.data) {
  //       // TODO ca-grouped does not currently have unlicensed ones
  //       // Fall back to find unlicensed case
  //       const type =
  //         d["License Type"] === "\u00A0"
  //           ? null
  //           : !d["License Type"]
  //           ? null
  //           : d["License Type"];
  //       if (licenseTypes.includes(type)) {
  //         return true;
  //       }
  //     }
  //     return false;
  //   });
  // }

  // if (offenses.length) {
  //   results = results.filter((result) => {
  //     for (let d of result.data) {
  //       for (let o of offenses) {
  //         if (d["Offenses"]?.includes(o)) {
  //           return true;
  //         }
  //       }
  //     }
  //     return false;
  //   });
  // }

  // if (query) {
  //   const options = {
  //     includeScore: false,
  //     keys: [
  //       // {
  //       //   name: "fullName",
  //       //   getFn: (r: any) => `${r.data["First Name"]} ${r.data["Last Name"]}`,
  //       // },
  //       ["data", "First Name"],
  //       ["data", "Middle Name"],
  //       ["data", "Last Name"],
  //       // TODO This should not be 'full-text-searchable' because numbers being close doesn't mean anything
  //       // {
  //       //   name: "fullLicense",
  //       //   getFn: (r: any) => `${r["License Type"]}${r["License Number"]}`,
  //       // },
  //     ],
  //   };

  //   const fuse = new Fuse(results, options);

  //   results = fuse.search(query).map((r) => r.item);
  // }

  const chartData = results.reduce<any>((acc, curr) => {
    for (let i = 0; i < curr.data.actions?.length; i++) {
      // For some reason some don't have date it seems
      const year = curr.data.actions[i].date?.split(",")[1].trim();
      if (year) {
        acc[year] = (acc[year] ?? 0) + 1;
      }
    }
    return acc;
  }, {});

  return {
    // Recalculated since this is for filtered results
    numResults: results.length,
    results: results.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    lastUpdated: data.deepLastRun,
    chartData: Object.keys(chartData)
      .sort()
      .map((k) => ({ k, v: chartData[k] })),
  };
};
