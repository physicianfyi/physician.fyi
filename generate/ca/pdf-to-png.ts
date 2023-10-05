/**
 * Simultaneous Step 3: Convert pdfs to pngs for OCR
 */

import fs from "fs";
import path from "path";
// Requires canvas, which requires brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman
import pdf2img from "pdf-img-convert";
// Could also use pdf.js but need to us jsdom and canvas to manually make it like in https://github.com/racosa/pdf2text-ocr/blob/main/index.html#L125
// Or use https://github.com/yakovmeister/pdf2image
import { mkdir } from "fs/promises";

const SOURCE_DIR = "data/ca/pdfs/";
const DEST_DIR = "data/ca/pngs/";

const process = (files: any[], errors: any) =>
  Promise.all(
    files.map(async (file) => {
      if (!file.endsWith(".pdf")) {
        return;
      }

      // For some reason some are skipped, directory is made but empty, so proceed if directory empty
      // TODO Could refine this check to make sure there are the number of pages of the pdf in pngs
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

(async () => {
  const files = fs.readdirSync(SOURCE_DIR);
  const errors: any = {};

  // For some reason running all at once ends up with size 0 files and empty dirs still, so trying batching instead so it can free memory after each batch
  while (files.length) {
    const batch = files.splice(0, 20);
    await process(batch, errors);
    console.log(`Processed batch`);
  }

  console.log(errors);

  // fs.writeFile(
  //   "data/ca/png.json",
  //   JSON.stringify({
  //     lastRun: new Date(),
  //     errors,
  //   }),
  //   (error) => {
  //     if (error) throw error;
  //   }
  // );
})();
