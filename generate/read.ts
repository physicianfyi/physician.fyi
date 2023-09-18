/**
 * Gets causes for discipline from documents that are type Decision
 */

import fs from "fs";

const SOURCE_DIR = "public/txts/";

(async () => {
  const files = fs.readdirSync(SOURCE_DIR);
  const errors: any = {};

  await Promise.all(
    files.map(async (file) => {
      if (!file.endsWith(".txt")) {
        return;
      }

      const text = fs.readFileSync(`${SOURCE_DIR}${file}`, "utf8");
      // JS doesn't have ungreedy flag https://stackoverflow.com/a/364029/9703201
      const regexp = /causes?\sfor\sdiscipline(.*?)\)/gis;
      const causes = [...text.matchAll(regexp)].map((r) =>
        r[1].split("(").at(-1)
      );
      console.log(causes);
    })
  );

  fs.writeFile(
    "data/read.json",
    JSON.stringify({
      lastRun: new Date(),
      errors,
    }),
    (error) => {
      if (error) throw error;
    }
  );
})();
