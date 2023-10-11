import fs from "fs";
import Fuse from "fuse.js";
import { PAGE_SIZE } from "./constants";
import path from "path";

/**
 * Select paginated, filtered physicians
 */
export const selectPhysicians = async ({
  page = 0,
  query = "",
  actionTypes = [],
  licenseStatuses = [],
  licenseTypes = [],
  schools = [],
  specialties = [],
  offenses = [],
  beginning,
  ending,
}: {
  page?: number;
  query?: string;
  actionTypes?: string[];
  licenseStatuses?: string[];
  licenseTypes?: string[];
  schools?: string[];
  specialties?: string[];
  offenses?: string[];
  beginning?: number;
  ending?: number;
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

  if (licenseStatuses.length) {
    results = results.filter((result) => {
      // Only have licensed ones right now, so need to fix if adding unlicensed
      if (licenseStatuses.includes(result.data.licenseStatus)) {
        return true;
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

  if (beginning) {
    results = results.filter((result) => {
      if (
        result.data.actions?.some(
          (action: any) => Number(action.date.split(",")[1].trim()) >= beginning
        )
      ) {
        return true;
      }
      return false;
    });
  }

  if (ending) {
    results = results.filter((result) => {
      if (
        result.data.actions?.some(
          (action: any) => Number(action.date.split(",")[1].trim()) <= ending
        )
      ) {
        return true;
      }
      return false;
    });
  }

  if (query) {
    const options: Fuse.IFuseOptions<(typeof results)[number]> = {
      includeScore: false,
      keys: query.match(/^[a-zA-Z] [0-9]+$/) ? ["license"] : [["data", "name"]],
      // Default is .6, but got complaint that it's too lenient
      threshold: 0.5,
      ignoreLocation: true,
    };

    const fuse = new Fuse(results, options);

    results = fuse.search(query).map((r) => r.item);
  }

  // TODO Sort by if their license is active or not

  // Need to do chart data and geo data before paginating
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

  const geoData = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "data/ca/geocode.json"), "utf8")
  );
  const geo = {
    type: "FeatureCollection",
    features: results.reduce<any[]>((acc, { license, data }) => {
      if (geoData[license]) {
        acc.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [geoData[license].lon, geoData[license].lat, 0],
          },
          properties: {
            id: license,
            name: data.name,
            numActions: data.actions?.length ?? 0,
          },
        });
      }
      return acc;
    }, []),
  };

  return {
    // Recalculated since this is for filtered results
    numResults: results.length,
    results: results.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    lastUpdated: data.deepLastRun,
    chartData: Object.keys(chartData)
      .sort()
      .map((k) => ({
        year: Number(k),
        actions: chartData[k].actions,
        physicians: chartData[k].physicians,
      })),
    geo,
  };
};
