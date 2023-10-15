/**
 * Step 1b: Deep scrape
 */

import fs from "fs";
import { request, Agent } from "undici";
import crypto from "node:crypto";
import Papa from "papaparse";
import puppeteer from "puppeteer";
import { delay } from "generate/util";

(async () => {
  // Diff with stored profile if exists
  let profiles: any = {};
  try {
    profiles = JSON.parse(
      fs.readFileSync("data/fl/scrape-deep.json", "utf8")
    ).profiles;
  } catch {}

  let shallowProfiles: any = {};
  try {
    shallowProfiles = JSON.parse(
      fs.readFileSync("data/fl/scrape-shallow.json", "utf8")
    ).profiles;
  } catch {}

  const response = await request(
    "https://mqa-internet.doh.state.fl.us/MQASearchServices/EnforcementActionsPractitioner/ExportToCsv?jsonModel=%7B%22Id%22%3A0%2C%22Board%22%3Anull%2C%22Profession%22%3A%221501%22%2C%22SpecialtyOrCertification%22%3Anull%2C%22CaseNumber%22%3Anull%2C%22FirstName%22%3Anull%2C%22LastName%22%3Anull%2C%22City%22%3Anull%2C%22County%22%3Anull%2C%22State%22%3Anull%2C%22ZipCode%22%3Anull%2C%22ActionTaken%22%3Anull%2C%22ActionTakenStartDate%22%3Anull%2C%22ActionTakenEndDate%22%3Anull%7D",
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

  const parsed = Papa.parse(text, {});

  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  for (let i = 1; i < parsed.data.length; i++) {
    console.log(i);
    const entry = parsed.data[i] as string[];
    const license = entry[1];
    const shallowEntry = Object.values(shallowProfiles).find(
      (p: any) => p["License-Number"] === license
    ) as any;
    // This is not possible since we are going through actions
    // if (shallowEntry["Board-Action-Indicator"] === 'N') {
    //   continue;
    // }
    const licenseId = shallowEntry["lic_id"];
    const professionCode = shallowEntry["pro_cde"];
    const url = `https://mqa-internet.doh.state.fl.us/MQASearchServices/HealthCareProviders/LicenseVerification?LicInd=${licenseId}&ProCde=${professionCode}`;

    // Navigate the page to a URL
    await page.goto(url);

    // Set screen size
    await page.setViewport({ width: 1080, height: 1024 });

    await page.click("a[href='#Disciplines']");

    // This is network request so give it some leeway, 3000 seemed to mostly work
    await delay(5000);

    const caseNumber = entry[6];

    // For some reason this way doesn't seem to work
    // Sometimes there is no caseId, ie no link to PDF
    const documentId = await page.evaluate((caseNumber) => {
      const onclick = document
        .evaluate(
          `//a[contains(text(), '${caseNumber}')]`,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        )
        // @ts-ignore
        .singleNodeValue?.getAttribute("onclick");
      return onclick?.split("('")[1].split("')")[0];
    }, caseNumber);

    if (!documentId) continue;

    const existingActions = profiles[licenseId]?.actions ?? [];

    if (
      !existingActions.find(
        (a: any) =>
          a.documentId === documentId &&
          a.actionType === entry[7] &&
          a.date === entry[8]
      )
    ) {
      profiles[licenseId] = {
        actions: [
          ...existingActions,
          {
            documentId,
            actionType: entry[7],
            date: entry[8],
          },
        ],
      };
    }

    fs.writeFile(
      "data/fl/scrape-deep.json",
      JSON.stringify({
        deepLastRun: new Date(),
        numProfiles: Object.keys(profiles).length,
        profiles,
        baseUrl:
          "https://mqa-internet.doh.state.fl.us/MQASearchServices/Document",
      }),
      (error) => {
        if (error) throw error;
      }
    );

    // break;
  }

  await browser.close();
})();
