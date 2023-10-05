/**
 * Stream 2 Step 2: Download PDFs from actions
 */

import fs from "fs";
import { downloadFile } from "generate/util";

(async () => {
  const data = JSON.parse(fs.readFileSync("data/ca/scrape-deep.json", "utf8"));
  const profiles = data.profiles;

  for (let [, v] of Object.entries<any>(profiles)) {
    for (let i = 0; i < (v.actions?.length ?? 0); i++) {
      const url = v.actions[i].url;
      if (!url) continue;

      const parsedUrl = new URL(url);
      const did = parsedUrl.searchParams.get("did");
      const path = `data/ca/pdfs/${did}.pdf`;

      if (!fs.existsSync(path)) {
        console.log(path);
        await downloadFile(url, path).catch((e) => {
          console.log(e, url);
        });
      }
    }
  }
})();
