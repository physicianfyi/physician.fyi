/**
 * Step 1a: Marks profiles that need to deep scraped
 * Shallow scrape of Department of Consumer Affairs advanced search, which contains both medical board documents/actions as well as 3rd-party actions like settlements above 30k reported to the medical board
 */

import puppeteer from "puppeteer";
import fs from "fs";
import { delay } from "../util";

const PAGE_URL = "https://search.dca.ca.gov/advanced";

(async () => {
  // Diff with stored profile if exists
  const profiles =
    JSON.parse(fs.readFileSync("data/ca/scrape.json", "utf8")).profiles ?? {};

  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto(PAGE_URL);

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });

  console.log(await page.title());

  // Loop through all states' counties
  const states = await page.evaluate(() =>
    Array.from(document.querySelectorAll("#counties > optgroup")).map(
      (element) => element.id
    )
  );

  // TODO Add state to summarize and only go through top couple states since it takes days otherwise for minimal return
  const startIndex = states.findIndex((e) => e === "MO_cities");
  for (let state of states.slice(startIndex)) {
    console.log({ state });
    // Need to go through cities instead of counties since LA county has > 1k results
    const cities = await page.evaluate(
      (state) =>
        Array.from(
          document.querySelectorAll(`#cities > #${state} > option`)
        ).map((element: any) => element.value),
      state
    );

    for (let city of cities) {
      console.log({ city });
      await page.select("#cities", city);
      await page.select("#boardCode", "16");
      await page.select("#hasDiscipline", "Yes");
      await page.click("#srchSubmitHome");

      // Wait for page to load
      const numResults = await (await page.waitForSelector(
        "#mainForm > #wrapper > header.resultsHeader"
      ))!.evaluate((el: any) => {
        return Number(el.innerText.split(" RESULTS")[0]);
      });

      let results = await page.$$("#main > article.post:not(.doNotCount)");

      // Actually need to wait additional time for results to stream in after first part of page comes in
      while (results.length < numResults) {
        await delay(2000);
        results = await page.$$("#main > article.post:not(.doNotCount)");
      }

      for (let r of results) {
        const profile = await r.evaluate((element: any) => {
          const profile: any = {};
          const data = Array.from<any>(
            element.querySelectorAll("ul.actions > li")
          );
          profile.name = data[0]?.innerText.toLowerCase().trim();
          profile.license = data[1]
            .querySelector("a > span")
            ?.innerText?.toLowerCase()
            .trim();
          profile.licenseUrl = data[1].querySelector("a")?.getAttribute("href");
          profile.licenseType = data[2]?.innerText
            .toLowerCase()
            .trim()
            .split("license type: ")[1];
          profile.licenseStatus = data[3]?.innerText
            .toLowerCase()
            .trim()
            .split("license status: ")[1];
          profile.licenseExpiresAt = data[4]?.innerText
            .toLowerCase()
            .trim()
            .split("expiration date: ")[1];
          profile.secondaryStatus = Array.from(
            data[5].querySelectorAll("div > ul > li > span.relDetailHeader")
          ).map((e: any) => e?.innerText?.toLowerCase().trim());
          profile.city = data[6]?.innerText
            .toLowerCase()
            .trim()
            .split("city: ")[1];
          profile.state = data[7]?.innerText
            .toLowerCase()
            .trim()
            .split("state: ")[1];
          profile.county = data[8]?.innerText
            .toLowerCase()
            .trim()
            .split("county: ")[1];
          profile.zip = data[9]?.innerText
            .toLowerCase()
            .trim()
            .split("zip: ")[1];
          return profile;
        });

        const license = profile.license;

        // Handle a 'previous name' profile which has same info as a normal profile
        if (profile.name.endsWith("(previous name)")) {
          if (profiles.hasOwnProperty(license)) {
            profiles[license].previousNames = Array.from(
              new Set([
                ...(profiles[license].previousNames ?? []),
                profile.name.split("(previous name)")[0].trim(),
              ])
            );
          } else {
            profile.previousNames = [
              profile.name.split("(previous name)")[0].trim(),
            ];
          }
          // This will be populated when the normal profile comes up
          delete profile.name;
        }

        // Update profile fields if new one present and different
        if (profiles.hasOwnProperty(license)) {
          if (profile.name && profile.name !== profiles[license].name) {
            // Save what is now a previous name when encountering a new name that doesn't match what we had
            profiles[license].previousNames = Array.from(
              new Set([
                ...(profiles[license].previousNames ?? []),
                profiles[license].name,
              ])
            );
            profiles[license].name = profile.name;
            // Indicate deep search needs to refetch this profile
            profiles[license].fetch = true;
          }
          // Could only modify licenseUrl when not on a previous name profile, but doesn't matter since they're the same
          if (
            profile.licenseUrl &&
            profile.licenseUrl !== profiles[license].licenseUrl
          ) {
            profiles[license].licenseUrl = profile.licenseUrl;
            profiles[license].fetch = true;
          }
          if (
            profile.licenseType &&
            profile.licenseType !== profiles[license].licenseType
          ) {
            profiles[license].licenseType = profile.licenseType;
            profiles[license].fetch = true;
          }
          if (
            profile.licenseStatus &&
            profile.licenseStatus !== profiles[license].licenseStatus
          ) {
            profiles[license].licenseStatus = profile.licenseStatus;
            profiles[license].fetch = true;
          }
          if (
            profile.licenseExpiresAt &&
            profile.licenseExpiresAt !== profiles[license].licenseExpiresAt
          ) {
            profiles[license].licenseExpiresAt = profile.licenseExpiresAt;
            profiles[license].fetch = true;
          }
          if (
            profile.secondaryStatus &&
            !profile.secondaryStatus.every((value: string) =>
              profiles[license].secondaryStatus.includes(value)
            )
          ) {
            profiles[license].secondaryStatus = Array.from(
              new Set([
                ...profile.secondaryStatus,
                ...profiles[license].secondaryStatus,
              ])
            );
            profiles[license].fetch = true;
          }
          if (profile.city && profile.city !== profiles[license].city) {
            profiles[license].city = profile.city;
            profiles[license].fetch = true;
          }
          if (profile.state && profile.state !== profiles[license].state) {
            profiles[license].state = profile.state;
            profiles[license].fetch = true;
          }
          if (profile.county && profile.county !== profiles[license].county) {
            profiles[license].county = profile.county;
            profiles[license].fetch = true;
          }
          if (profile.zip && profile.zip !== profiles[license].zip) {
            profiles[license].zip = profile.zip;
            profiles[license].fetch = true;
          }
        } else {
          delete profile.license;
          profile.fetch = true;
          profiles[license] = profile;
        }
      }

      await page.goto(PAGE_URL);
    }

    // Write after every state in case of crash since it's easy to slice the rest
    const json = {
      shallowLastRun: new Date(),
      numProfiles: Object.keys(profiles).length,
      profiles,
      baseUrl: "https://search.dca.ca.gov",
    };
    fs.writeFile("data/ca/scrape.json", JSON.stringify(json), (error) => {
      if (error) throw error;
    });
  }

  await browser.close();
})();
