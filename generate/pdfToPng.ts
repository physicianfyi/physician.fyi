/**
 * Convert pdfs to pngs
 */

import fs from "fs";
import path from "path";
// Requires canvas, which requires brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman
import pdf2img from "pdf-img-convert";
// Could also use pdf.js but need to us jsdom and canvas to manually make it like in https://github.com/racosa/pdf2text-ocr/blob/main/index.html#L125
// Or use https://github.com/yakovmeister/pdf2image
import { mkdir } from "fs/promises";

const SOURCE_DIR = "public/pdfs/";
const DEST_DIR = "public/pngs/";

(async () => {
  const errors: any = {};

  const files = fs.readdirSync(SOURCE_DIR);

  await Promise.all(
    files.map(async (file) => {
      if (!file.endsWith(".pdf")) {
        return;
      }

      // For some reason some are skipped, directory is made but empty, so proceed if directory empty
      if (
        fs.existsSync(`${DEST_DIR}${file}/`) &&
        fs.readdirSync(`${DEST_DIR}${file}/`).filter((f) => f.endsWith(".png"))
          .length
      ) {
        return;
      }

      // Tesseract doesn't do PDFs
      const pdfArray = await pdf2img
        .convert(path.resolve(SOURCE_DIR, file), {
          scale: 2.0,
        })
        .catch((e) => {
          errors[file] = e.toString();
        });

      if (!pdfArray) {
        return;
      }

      if (!fs.existsSync(`${DEST_DIR}${file}/`)) {
        await mkdir(`${DEST_DIR}${file}/`);
      }

      for (let i = 0; i < pdfArray.length; i++) {
        fs.writeFile(
          `${DEST_DIR}${file}/${i}.png`,
          pdfArray[i],
          function (error) {
            if (error) {
              console.error("Error: " + error);
            }
          }
        );
      }

      console.log(`Converted ${path.resolve(file)}`);
    })
  );

  fs.writeFile(
    "data/png.json",
    JSON.stringify({
      lastRun: new Date(),
      errors,
    }),
    (error) => {
      if (error) throw error;
    }
  );
})();
