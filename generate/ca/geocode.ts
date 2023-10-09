/**
 * Step 3: Geocode
 */

import fs from "fs";
import NodeGeocoder from "node-geocoder";

(async () => {
  const profiles = JSON.parse(
    fs.readFileSync("data/ca/clean.json", "utf8")
  ).profiles;

  let file = "{}";
  try {
    file = fs.readFileSync("data/ca/geocode.json", "utf8");
  } catch {}
  const data = JSON.parse(file);

  const geocoder = NodeGeocoder({
    provider: "openstreetmap",
  });

  // const response = await geocoder.geocode(
  //   {
  //     // street: "2680 saturn ave",
  //     city: "huntington park",
  //     county: "los angeles",
  //     state: "california",
  //     postalcode: "90255",
  //   }
  //   // "2680 saturn ave ste 210, huntington park, los angeles, california, 90255"
  // );
  // console.log(response);
  // return;

  const arrayProfiles = Object.entries<any>(profiles);

  while (arrayProfiles.length) {
    const batch = arrayProfiles.splice(0, 30);
    // Remake queries each batch
    const queries: any = {};
    for (let [k, v] of batch) {
      if (!data[k]) {
        const query = `${v.address}, ${v.city}, ${v.county}, ${v.state}, ${v.zip}`;
        queries[k] = query;
      }
    }

    console.log(queries);

    const results = await geocoder.batchGeocode(Object.values<any>(queries));
    console.log(results);

    for (let i = 0; i < results.length; i++) {
      if (results[i].value?.[0]?.latitude) {
        const key = batch[i][0];
        console.log(key);
        data[key] = {
          lat: results[i].value[0].latitude,
          lon: results[i].value[0].longitude,
        };
        delete queries[key];
      }
    }

    fs.writeFile("data/ca/geocode.json", JSON.stringify(data), (error) => {
      if (error) throw error;
    });

    // Retry ones that failed likely because the address had a suite, so just geocode to zip code level
    for (let [k] of Object.entries<any>(queries)) {
      const v = profiles[k];
      const query = `${v.city}, ${v.county}, ${v.state}, ${v.zip}`;
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
        };
        // Can't delete when looking up, but since this is fallback case, just ignore failed ones
        // delete queries[key];
      }
    }

    fs.writeFile("data/ca/geocode.json", JSON.stringify(data), (error) => {
      if (error) throw error;
    });
  }
})();
