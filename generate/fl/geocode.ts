/**
 * Step 3: Geocode
 */

import fs from "fs";
import NodeGeocoder from "node-geocoder";

(async () => {
  const profiles = JSON.parse(
    fs.readFileSync("data/fl/clean.json", "utf8")
  ).profiles;

  let file = "{}";
  try {
    file = fs.readFileSync("data/fl/geocode.json", "utf8");
  } catch {}
  const data = JSON.parse(file);

  const geocoder = NodeGeocoder({
    provider: "openstreetmap",
  });

  // const response = await geocoder.geocode(
  //   {
  //     // street: "2680 saturn ave",
  //     city: "stuart",
  //     county: "martin",
  //     state: "fl",
  //     postalcode: "34995",
  //     // country: undefined,
  //   }
  //   // "2680 saturn ave ste 210, huntington park, los angeles, california, 90255"
  // );
  // console.log(response);
  // return;

  const arrayProfiles = Object.entries<any>(profiles)
    // Filter here because we index into batch later and indices get messed up if excluding things then
    .filter(([k, v]) => !data.hasOwnProperty[k]);
  // .slice(0, 1);

  while (arrayProfiles.length) {
    const batch = arrayProfiles.splice(0, 30);
    // Remake queries each batch
    const queries: any = {};
    for (let [k, v] of batch) {
      // Try with address
      // TODO Florida stores countries in city field so need to check country list
      queries[k] = {
        ...(v.address != "none" && { street: v.address }),
        ...(v.city != "NONE" && { city: v.city }),
        ...(v.county != "UNKNOWN" && { county: v.county }),
        ...(v.zip != "00000" && { postalcode: v.zip.split("-")[0] }),
        state: v.state,
        // Sending undefined breaks API
        // ...(v.country && { country: v.country }),
      };
    }

    console.log(queries);

    const results = await geocoder.batchGeocode(Object.values<any>(queries));
    console.log(results);

    for (let i = 0; i < results.length; i++) {
      if (results[i].value?.[0]?.latitude) {
        // Index into batch here, so need same number of items processed
        const key = batch[i][0];
        console.log(key);
        data[key] = {
          lat: results[i].value[0].latitude,
          lon: results[i].value[0].longitude,
          query: queries[key],
        };
        delete queries[key];
      }
    }

    fs.writeFile("data/fl/geocode.json", JSON.stringify(data), (error) => {
      if (error) throw error;
    });

    // Retry ones that failed likely because the address had a suite, so just geocode to zip code level
    for (let [k] of Object.entries<any>(queries)) {
      const v = profiles[k];
      // Try without address if it didn't work
      const query = {
        ...(v.city != "NONE" && { city: v.city }),
        ...(v.county != "UNKNOWN" && { county: v.county }),
        ...(v.zip != "00000" && { postalcode: v.zip.split("-")[0] }),
        state: v.state,
      };
      queries[k] = query;
    }

    const results2 = await geocoder.batchGeocode(Object.values<any>(queries));
    console.log(results2);

    for (let i = 0; i < results2.length; i++) {
      if (results2[i].value?.[0]?.latitude) {
        const key = Object.keys(queries)[i];
        data[key] = {
          lat: results2[i].value[0].latitude,
          lon: results2[i].value[0].longitude,
          query: queries[key],
        };
        // Can't delete when looking up, but since this is fallback case, just ignore failed ones
        // delete queries[key];
      }
    }

    fs.writeFile("data/fl/geocode.json", JSON.stringify(data), (error) => {
      if (error) throw error;
    });
  }
})();
