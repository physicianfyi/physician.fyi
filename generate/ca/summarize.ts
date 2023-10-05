/**
 * Step 3: Enumerate filterable fields and get counts of actions involving them
 * Maps type to number to shorten URL via index and doesn't remap existing ones on subsequent runs
 */

import fs from "fs";

(async () => {
  const profiles = JSON.parse(
    fs.readFileSync("data/ca/clean.json", "utf8")
  ).profiles;

  let file;
  try {
    file = fs.readFileSync("data/ca/summarize.json", "utf8");
  } catch {
    file = "{}";
  }
  const data = JSON.parse(file);

  const licenseTypes: string[] = data.licenseTypes?.results ?? [];
  // Store counts while ordering is in array so it doesn't get changed during object serialization...
  const licenseTypeCounts: any = {};
  const licenseStatuses: string[] = data.licenseStatuses?.results ?? [];
  const licenseStatusCounts: any = {};
  // Secondary statuses only seem to appear once even if multiple actions for one, and once the license is revoked, they are cleared
  const secondaryStatuses: string[] = data.secondaryStatuses?.results ?? [];
  const secondaryStatusCounts: any = {};
  const schools: string[] = data.schools?.results ?? [];
  const schoolCounts: any = {};
  const graduationYears: number[] = data.graduationYears?.results ?? [];
  const graduationYearCounts: any = {};
  const actionTypes: string[] = data.actionTypes?.results ?? [];
  const actionTypeCounts: any = {};
  // Not doing geospatial ones right now because might not need

  for (let [, v] of Object.entries<any>(profiles)) {
    // Only difference with using just DCA as data source is there are no unlicensed ones
    const licenseType = v.licenseType;
    if (!licenseTypes.includes(licenseType)) {
      licenseTypes.push(licenseType);
    }
    // TODO Some counts should be by number of actions once available
    licenseTypeCounts[licenseType] = (licenseTypeCounts[licenseType] ?? 0) + 1;

    const licenseStatus = v.licenseStatus;
    if (!licenseStatuses.includes(licenseStatus)) {
      licenseStatuses.push(licenseStatus);
    }
    licenseStatusCounts[licenseStatus] =
      (licenseStatusCounts[licenseStatus] ?? 0) + 1;

    const secondaryStatus = v.secondaryStatus;
    for (let s of secondaryStatus) {
      if (!secondaryStatuses.includes(s)) {
        secondaryStatuses.push(s);
      }
      secondaryStatusCounts[s] = (secondaryStatusCounts[s] ?? 0) + 1;
    }

    const school = v.school;
    if (!schools.includes(school)) {
      schools.push(school);
    }
    schoolCounts[school] = (schoolCounts[school] ?? 0) + 1;

    const graduationYear = v.graduationYear;
    if (!graduationYears.includes(graduationYear)) {
      graduationYears.push(graduationYear);
    }
    graduationYearCounts[graduationYear] =
      (graduationYearCounts[graduationYear] ?? 0) + 1;

    const actions = v.actions ?? [];
    for (let a of actions) {
      if (!actionTypes.includes(a.actionType)) {
        actionTypes.push(a.actionType);
      }
      actionTypeCounts[a.actionType] =
        (actionTypeCounts[a.actionType] ?? 0) + 1;
    }
  }

  const json = {
    lastRun: new Date(),
    licenseTypes: {
      numResults: licenseTypes.length,
      results: licenseTypes,
      counts: Object.fromEntries(
        Object.entries<any>(licenseTypeCounts).sort(([, a], [, b]) => b - a)
      ),
    },
    licenseStatuses: {
      numResults: licenseStatuses.length,
      results: licenseStatuses,
      counts: Object.fromEntries(
        Object.entries<any>(licenseStatusCounts).sort(([, a], [, b]) => b - a)
      ),
    },
    secondaryStatuses: {
      numResults: secondaryStatuses.length,
      results: secondaryStatuses,
      counts: Object.fromEntries(
        Object.entries<any>(secondaryStatusCounts).sort(([, a], [, b]) => b - a)
      ),
    },
    schools: {
      numResults: schools.length,
      results: schools,
      counts: Object.fromEntries(
        Object.entries<any>(schoolCounts).sort(([, a], [, b]) => b - a)
      ),
    },
    graduationYears: {
      numResults: graduationYears.length,
      results: graduationYears,
      // This was a nice to have but it doesn't work with keys that parse as numbers https://stackoverflow.com/a/71849295/9703201
      counts: Object.fromEntries(
        Object.entries<any>(graduationYearCounts).sort(([, a], [, b]) => b - a)
      ),
    },
    actionTypes: {
      numResults: actionTypes.length,
      results: actionTypes,
      counts: Object.fromEntries(
        Object.entries<any>(actionTypeCounts).sort(([, a], [, b]) => b - a)
      ),
    },
  };
  fs.writeFile("data/ca/summarize.json", JSON.stringify(json), (error) => {
    if (error) throw error;
  });
})();
