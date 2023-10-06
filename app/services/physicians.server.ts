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
  schools = [],
  specialties = [],
  offenses = [],
}: {
  page?: number;
  query?: string;
  actionTypes?: string[];
  licenseTypes?: string[];
  schools?: string[];
  specialties?: string[];
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

  if (licenseTypes.length) {
    results = results.filter((result) => {
      // Only have licensed ones right now, so need to fix if adding unlicensed
      if (licenseTypes.includes(result.data.licenseType)) {
        return true;
      }
      return false;
    });
  }

  if (schools.length) {
    results = results.filter((result) => {
      if (schools.includes(result.data.school)) {
        return true;
      }
      return false;
    });
  }

  if (specialties.length) {
    results = results.filter((result) => {
      if (
        specialties.includes(
          result.data.survey?.["PRIMARY AREA OF PRACTICE"]
        ) ||
        result.data.survey?.["SECONDARY AREA OF PRACTICE"]?.some((a: string) =>
          specialties.includes(a)
        )
      ) {
        return true;
      }
      return false;
    });
  }

  if (offenses.length) {
    const read = JSON.parse(
      fs.readFileSync("data/ca/read.json", "utf8")
    ).results;

    results = results.filter((result) => {
      for (let action of result.data.actions ?? []) {
        const url = action.url;
        if (!url) continue;

        const parsedUrl = new URL(url);
        const did = parsedUrl.searchParams.get("did");
        const path = `${did}.pdf.txt`;

        if (read[path] && offenses.some((o) => read[path].includes(o))) {
          return true;
        }
      }

      return false;
    });
  }

  if (query) {
    const options = {
      includeScore: false,
      keys: query.match(/^[a-zA-Z] [0-9]+$/) ? ["license"] : [["data", "name"]],
    };

    const fuse = new Fuse(results, options);

    results = fuse.search(query).map((r) => r.item);
  }

  const chartData = results.reduce<any>((acc, curr) => {
    // Don't count multiple actions in the same year for number of physicians
    const currentYears = new Set();
    for (let i = 0; i < (curr.data.actions?.length ?? 0); i++) {
      const year = curr.data.actions[i].date?.split(",")[1].trim();
      if (!year) {
        // console.error(curr);
        continue;
      }

      if (!acc[year]) {
        acc[year] = {};
      }

      if (!currentYears.has(year)) {
        acc[year].physicians = (acc[year].physicians ?? 0) + 1;
        currentYears.add(year);
      }

      acc[year].actions = (acc[year].actions ?? 0) + 1;
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
