/**
 * MBC results are in date descending, so subsequent runs will just go until we find one we already have
 */

import type { ElementHandle, Page } from "puppeteer";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { mkdir } from "fs/promises";
import { Readable } from "stream";
import { finished } from "stream/promises";

function delay(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

const downloadFile = async (url: string, folder = ".") => {
  const res = await fetch(url);
  if (!fs.existsSync("public")) await mkdir("public"); //Optional if you already have downloads directory
  const destination = path.resolve("./public", folder);
  const fileStream = fs.createWriteStream(destination, { flags: "wx" });
  await finished(Readable.fromWeb(res.body as any).pipe(fileStream));
};

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto("https://www2.mbc.ca.gov/PDL/Search.aspx");

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });

  console.log(await page.title());

  // Type into search box
  await page.type("#lastNameTextBox", "a");
  await page.click("#searchButton");

  await delay(1000);

  await page.evaluate(
    () => ((document.getElementById("lastNameTextBox") as any).value = "")
  );

  await page.click(
    `a[href="javascript:__doPostBack('resultsGridView','Page$2')"]`
  );

  await page.waitForSelector(
    `a[href="javascript:__doPostBack('resultsGridView','Page$1')"]`
  );
  await page.click(
    `a[href="javascript:__doPostBack('resultsGridView','Page$1')"]`
  );

  const numResultsElement = await page.waitForSelector(
    "#numberOfResultsFoundDIV"
  );
  const numResults = await numResultsElement!.evaluate((el: any) => {
    return Number(el.innerText.split(" ")[0]);
  });

  const columns = await getColumns(page);

  // TODO Make new runs read existing file and only read until first existing one, which also lets us keep ald ones that get taken down
  // TODO 2 of 17396 do not have PDF property

  let results: any[] = [];
  const json: any = {
    lastRun: new Date(),
  };
  // 20 results per page
  for (let pageNum = 1; pageNum <= numResults / 20; pageNum++) {
    console.log(`Page ${pageNum}`);
    let rows: ElementHandle<Element>[];
    try {
      // This seems to fix the 'Execution context was destroyed, most likely because of a navigation.' error and takes away need for delay after navigation
      await page.waitForSelector("#resultsGridView .resultsGridViewRow");
      // Could do page.waitForSelector("html") per https://github.com/puppeteer/puppeteer/issues/3323#issuecomment-677676833
      rows = await page.$$(
        "#resultsGridView .resultsGridViewRow, #resultsGridView .resultsGridViewRowAlt"
      );
    } catch (e) {
      console.log(`Error ${e}`);
      break;
    }

    for (let i = 0; i < rows.length; i++) {
      const result: any = {};
      const data = await rows[i].evaluate((element) => {
        return Array.from(element.querySelectorAll("td")).map(
          (td) => td.innerText
        );
      });
      for (let c = 0; c < columns.length; c++) {
        const text = data[c];
        if (!result[columns[c]]) {
          result[columns[c]] = text;
        } else {
          // Store second unnamed column as named
          result["DIDOCS"] = text;
        }
      }
      results.push(result);

      if (!fs.existsSync(`pdfs/${result["\xa0"]}.pdf`)) {
        const attr = await page.evaluate(
          (el) => el.getAttribute("onclick")?.slice(13).split(" #")[0],
          rows[i]
        );
        const url = `https://www2.mbc.ca.gov/PDL/${attr}`;
        await downloadFile(url, `pdfs/${result["\xa0"]}.pdf`);
      }
    }

    const nextPageButton = await page.waitForSelector(
      `a[href="javascript:__doPostBack('resultsGridView','Page$${
        pageNum + 1
      }')"]`
    );
    await nextPageButton!.click();
  }

  json.numResults = results.length;
  json.results = results;

  fs.writeFile("data/ca.json", JSON.stringify(json), (error) => {
    if (error) throw error;
  });

  console.log(results.length);

  await browser.close();
})();

async function getColumns(page: Page) {
  const data = await page.evaluate(() => {
    const tds = Array.from(document.querySelectorAll("#resultsGridView th"));
    return tds.map((td: any) => td.innerText);
  });

  return data;
}
