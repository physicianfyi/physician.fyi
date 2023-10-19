/**
 * Step 1a: Marks profiles that need to deep scraped
 * Shallow scrape of Department of Consumer Affairs advanced search, which contains both medical board documents/actions as well as 3rd-party actions like settlements above 30k reported to the medical board
 */

import fs from "fs";
import { request, Agent } from "undici";
import crypto from "node:crypto";

// Will deep scrape with URL pattern

(async () => {
  // Diff with stored profile if exists
  let profiles: any = {};
  try {
    profiles = JSON.parse(
      fs.readFileSync("data/fl/scrape-shallow.json", "utf8")
    ).profiles;
  } catch {}

  const response = await request(
    "https://ww10.doh.state.fl.us/pub/ldo/data/1501-P.txt",
    {
      // To avoid ERR_SSL_UNSAFE_LEGACY_RENEGOTIATION_DISABLED
      dispatcher: new Agent({
        connect: {
          rejectUnauthorized: false,
          secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
        },
      }),
    }
  );

  const text = await response.body.text();

  const lines = text.split(/\r\n|\n/);
  const keys = lines.shift()!.split("|");

  for (let line of lines) {
    const items = line.split("|");
    // Note license id (2) gives full results whereas license number (6) has a few hundred dupes for some reason
    // Only caveat is deep data is keyed on license number so a little less effecient
    const license = items[2];
    // There are sometimes empty lines
    if (!license) {
      continue;
    }

    // For now skip ones we already have
    // TODO Diff them and save changes and mark as needing a new deep scrape
    if (profiles.hasOwnProperty(license)) {
      continue;
    }

    profiles[license] = {};

    for (let i = 0; i < keys.length; i++) {
      // Don't save keys we don't need
      // if (['pro_cde'].includes(keys[i])) {
      //   continue;
      // }
      if (items[i]) {
        profiles[license][keys[i]] = items[i];
      }
    }
  }

  const json = {
    shallowLastRun: new Date(),
    numProfiles: Object.keys(profiles).length,
    profiles,
    baseUrl: "https://mqa-internet.doh.state.fl.us/MQASearchServices",
  };
  fs.writeFile("data/fl/scrape-shallow.json", JSON.stringify(json), (error) => {
    if (error) throw error;
  });
})();
