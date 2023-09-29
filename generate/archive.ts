/**
 * Archive pdfs from MBC
 */

import fs from "fs";
import { delay } from "./util";
import { ProxyAgent, request } from "undici";
import cliProgress from "cli-progress";

// Another script will get the urls for the archived files

// https://www2.mbc.ca.gov/PDL/document.aspx?path=%5cDIDOCS%5c20180821%5cDMRAAAGL4%5c&did=AAAGL180821160738090.DID&licenseType=SFP&licenseNumber=18%20%20%20
// https://www2.mbc.ca.gov/PDL/document.aspx?path=%5cDIDOCS%5c20180821%5cDMRAAAGL4%5c&did=AAAGL180821160738090.DID
// \\DIDOCS\\20180821\\DMRAAAGL4\\

const START_INDEX = 0;
const BATCH_SIZE = 20;

(async () => {
  // const proxies = fs.readFileSync("data/proxies.txt", "utf8").split("\r\n");
  const proxies = [];

  const func = async (attempt: number, d: any, i: number) => {
    const path = encodeURIComponent(d.DIDOCS);
    const did = d["\xa0"];
    const url = `https://www2.mbc.ca.gov/PDL/document.aspx?path=${path}&did=${did}`;
    // Logging after progress bar makes dupe bar
    // console.log(i, url);
    const formData = new FormData();
    formData.append("url", url);
    formData.append("capture_all", "on");
    const proxy = new ProxyAgent({
      uri: `http://${proxies[(i + attempt * 20) % proxies.length]}`,
    });
    console.log(url);

    // https://stackoverflow.com/questions/73817412/why-is-the-agent-option-not-available-in-node-native-fetch
    return request(`https://web.archive.org/save/${url}`, {
      method: "POST",
      body: formData,
      // dispatcher: proxy,
    });
  };

  const data = JSON.parse(fs.readFileSync("data/ca.json", "utf8"));
  const results = data.results.slice(START_INDEX);

  const errors: any = {};

  // let currentIndex = START_INDEX;
  // while (results.length) {
  //   const batch = results.splice(0, BATCH_SIZE);
  //   // TODO May want to window through available proxies instead of just reusing first 20, but then will have to update retry logic
  //   // const proxyBatchStart = 0;
  //   const bar = new cliProgress.SingleBar(
  //     {},
  //     cliProgress.Presets.shades_classic
  //   );
  //   bar.start(BATCH_SIZE, 0, {
  //     speed: "N/A",
  //   });
  //   await Promise.all(
  //     batch.map(async (d: any, i: number) => {
  //       let attempt = 0;
  //       let response = await func(attempt, d, i).catch((e) => {
  //         // Only save error in last attempt
  //       });
  //       while (response?.statusCode !== 200 && attempt < 5) {
  //         console.log("retry");
  //         try {
  //           response = await func(++attempt, d, i);
  //         } catch (e) {
  //           if (attempt === 4) {
  //             errors[d.DIDOCS] = e;
  //           }
  //         }
  //       }
  //       // console.log(response.statusCode);
  //       // If no response, it was logged above in catch
  //       if (response && response.statusCode !== 200) {
  //         errors[d.DIDOCS] = response.statusCode;
  //       }
  //       bar.increment();
  //     })
  //   );
  //   bar.stop();
  //   console.log(`Processed batch ${(currentIndex += BATCH_SIZE)}`, errors);
  //   // break;
  // }

  for (let i = 0; i < results.length; i++) {
    const d = results[i];
    // if (d["\xa0"] === "FSMF8WPM.DID") console.log(i);
    const response = await func(0, d, 0);
    console.log(response.statusCode);

    await delay(20_000);
    // break;
    // Without proxies need to wait 20 seconds to avoid 429s
  }

  const json = {
    lastRun: new Date(),
    errors,
  };
  fs.writeFile("data/archive.json", JSON.stringify(json), (error) => {
    if (error) throw error;
  });
})();
