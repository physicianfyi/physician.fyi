/**
 * Archive pdfs from MBC
 */

import fs from "fs";
import { delay } from "../util";

(async () => {
  const data = JSON.parse(fs.readFileSync("data/ca/scrape-deep.json", "utf8"));
  let archive: any = { pdfs: {} };
  try {
    archive = JSON.parse(fs.readFileSync("data/ca/archive.json", "utf8"));
  } catch {}

  const errors: any = {};

  for (let [, v] of Object.entries<any>(data.profiles)) {
    for (let action of v.actions ?? []) {
      const url = action.url;
      if (!url || archive.urls.hasOwnProperty(url)) continue;

      console.log(url);

      const formData = new FormData();
      formData.append("url", url);
      formData.append("capture_all", "on");
      const response = await fetch(`https://web.archive.org/save/${url}`, {
        method: "POST",
        body: formData,
      });

      if (response.status === 200) {
        archive.pdfs[url] = new Date();
        archive.lastRun = new Date();
        fs.writeFile(
          "data/ca/archive.json",
          JSON.stringify(archive),
          (error) => {
            if (error) throw error;
          }
        );
      }

      // Without proxies need to wait 20 seconds to avoid 429s
      await delay(20_000);
    }
  }

  console.log(errors);
})();
