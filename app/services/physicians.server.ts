import fs from "fs";
import Fuse from "fuse.js";
import { PAGE_SIZE } from "./constants";

/**
 * Select paginated, filtered physicians
 */
export const selectPhysicians = async ({
  page = 0,
  query = "",
  types = [],
  licenseTypes = [],
}: {
  page?: number;
  query?: string;
  types?: string[];
  licenseTypes?: string[];
}) => {
  const data = JSON.parse(fs.readFileSync("data/ca-grouped.json", "utf8"));

  // TODO Also generate this as a new file like ca-grouped-flat.json
  let results = Object.keys(data.results).map((key) => ({
    license: key,
    data: data.results[key],
  }));

  if (types.length) {
    results = results.filter((result) => {
      for (let d of result.data) {
        if (types.includes(d["Type"])) {
          return true;
        }
      }
      return false;
    });
  }

  if (licenseTypes.length) {
    results = results.filter((result) => {
      for (let d of result.data) {
        // TODO ca-grouped does not currently have unlicensed ones
        // Fall back to find unlicensed case
        const type =
          d["License Type"] === "\u00A0"
            ? null
            : !d["License Type"]
            ? null
            : d["License Type"];
        if (licenseTypes.includes(type)) {
          return true;
        }
      }
      return false;
    });
  }

  if (query) {
    const options = {
      includeScore: false,
      keys: [
        // {
        //   name: "fullName",
        //   getFn: (r: any) => `${r.data["First Name"]} ${r.data["Last Name"]}`,
        // },
        ["data", "First Name"],
        ["data", "Middle Name"],
        ["data", "Last Name"],
        // TODO This should not be 'full-text-searchable' because numbers being close doesn't mean anything
        // {
        //   name: "fullLicense",
        //   getFn: (r: any) => `${r["License Type"]}${r["License Number"]}`,
        // },
      ],
    };

    const fuse = new Fuse(results, options);

    results = fuse.search(query).map((r) => r.item);
  }

  return {
    // Recalculated since this is for filtered results
    numResults: results.length,
    results: results.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    lastUpdated: data.lastRun,
  };
};
