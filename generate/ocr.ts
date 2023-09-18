/**
 * Run OCR and save text files
 */

import fs from "fs";
import Tesseract from "tesseract.js";
import path from "path";

const SOURCE_DIR = "public/pngs/";
const DEST_DIR = "public/txts/";

const process = (dirs: any[], errors: any) =>
  Promise.all(
    dirs.map(async (dir) => {
      if (!dir.endsWith(".pdf") || fs.existsSync(`${DEST_DIR}${dir}.txt`)) {
        return;
      }

      const files = fs.readdirSync(`${SOURCE_DIR}${dir}/`);

      const texts = await Promise.all(
        files.map(async (file) => {
          if (!file.endsWith(".png")) {
            return "";
          }

          const { data } = await Tesseract.recognize(
            `${SOURCE_DIR}${dir}/${file}`,
            "eng",
            {
              // logger: (m) => console.log(m),
            }
          );

          return data.text;
        })
      );

      fs.writeFile(`${DEST_DIR}${dir}.txt`, texts.join("\n"), function (err) {
        if (err) {
          return console.log(err);
        }
      });

      console.log(`Converted ${path.resolve(dir)}`);
    })
  );

(async () => {
  const dirs = fs.readdirSync(SOURCE_DIR);
  const errors: any = {};

  // For some reason running all at once ends up with size 0 files and empty dirs still, so trying batching instead so it can free memory after each batch
  while (dirs.length) {
    const batch = dirs.splice(0, 20);
    await process(batch, errors);
    console.log(`Processed batch`);
  }

  fs.writeFile(
    "data/ocr.json",
    JSON.stringify({
      lastRun: new Date(),
      errors,
    }),
    (error) => {
      if (error) throw error;
    }
  );
})();
