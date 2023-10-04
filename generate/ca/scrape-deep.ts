/**
 * Deep scrape of Department of Consumer Affairs advanced search, which contains both medical board documents/actions as well as 3rd-party actions like settlements above 30k reported to the medical board
 */

import puppeteer from "puppeteer";
import fs from "fs";

(async () => {
  const data = JSON.parse(fs.readFileSync("data/ca/temp.json", "utf8"));
  const profiles = data.profiles;

  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });

  for (let [license, profile] of Object.entries<any>(profiles)) {
    if (profile.fetch) {
      // Navigate the page to a URL
      await page.goto(`${data.baseUrl}${profile.licenseUrl}`);
      console.log(await page.title());

      const deepProfile = await page.evaluate((baseProfile) => {
        const profile: any = {};
        profile.licenseIssuedAt = document
          .getElementById("issueDate")
          ?.innerText.toLowerCase()
          .trim();
        profile.school = document
          .getElementById("schoolName")
          ?.innerText.toLowerCase()
          .trim()
          .split("school name: ")[1];
        profile.graduatedAt = document
          .getElementById("gradYear")
          ?.innerText.toLowerCase()
          .trim()
          .split("graduation year: ")[1];
        // TODO Can just get previous names here instead of combining in shallow scrape
        const address = document
          .getElementById("address")
          ?.querySelectorAll("p.wrapWithSpace")[1]
          ?.innerHTML.toLowerCase()
          .split("<br>");
        profile.address = address?.[0].replace(/,\s*$/, "");
        if (address?.[1] && !address[1].startsWith(baseProfile.city)) {
          profile.address2 = address[1];
        }

        profile.probationSummary = (
          document.querySelector(
            ".detailContainer > p > span > string[xmlns='http://schemas.microsoft.com/2003/10/Serialization/']"
          ) as any
        )?.innerText;

        // TODO Survey info
        // TODO Keep changelog

        const actions = [];
        // Could rely on secondaryStatus to see which sections to look for, but want to catch inconsistent cases
        const actionTypeIds = [
          "contentArbitrationAward",
          "contentAdministrativeDisciplinaryActions",
          "contentFelonyConviction",
          "contentMalpracticeJudgment",
          "contentAdministrativeActionTakenbyOtherStateorFederalGovernment",
          "contentAdministrativeCitationIssued",
          "contentMisdemeanorConviction",
        ];
        for (let actionType of actionTypeIds) {
          let i = 1;
          let el = document.getElementById(`${actionType}${i}`) as any;
          while (el) {
            const action: any = {
              actionType,
            };
            if (actionType === "contentArbitrationAward") {
              action.arbitrator = el
                .querySelector("#vArbitrationAwardArbitrator")
                ?.innerText.toLowerCase()
                .trim();
              action.docket = el
                .querySelector("#vArbitrationAwardDocketNumber")
                ?.innerText.toLowerCase()
                .trim();
              action.amount = el
                .querySelector("#vArbitrationAwardAmountofAward")
                ?.innerText.toLowerCase()
                .trim();
              action.date = el
                .querySelector("#vArbitrationAwardDateofAction")
                ?.innerText.toLowerCase()
                .trim();
              action.info = el
                .querySelector("#vArbitrationAwardAdditionalInformation")
                ?.innerText.toLowerCase()
                .trim();
            } else if (
              actionType === "contentAdministrativeDisciplinaryActions"
            ) {
              action.caseNumber = el
                .querySelector("#vAdministrativeDisciplinaryActionsCaseNumber")
                ?.innerText.toLowerCase()
                .trim();
              action.description = el
                .querySelector("#vAdministrativeDisciplinaryActionsDescription")
                ?.innerText.toLowerCase()
                .trim();
              action.effectiveAt = el
                .querySelector(
                  "#vAdministrativeDisciplinaryActionsEffectiveDate"
                )
                ?.innerText.toLowerCase()
                .trim();
            } else if (actionType === "contentFelonyConviction") {
              action.court = el
                .querySelector("#vFelonyConvictionCourt")
                ?.innerText.toLowerCase()
                .trim();
              action.docket = el
                .querySelector("#vFelonyConvictionDocket")
                ?.innerText.toLowerCase()
                .trim();
              action.description = el
                .querySelector("#vFelonyConvictionDescriptionofAction")
                ?.innerText.toLowerCase()
                .trim();
              action.sentence = el
                .querySelector("#vFelonyConvictionSentence")
                ?.innerText.toLowerCase()
                .trim();
              action.effectiveAt = el
                .querySelector("#vFelonyConvictionEffectiveDateofAction")
                ?.innerText.toLowerCase()
                .trim();
            } else if (actionType === "contentMalpracticeJudgment") {
              action.citationNumber = el
                .querySelector("#vMalpracticeJudgmentCitationNumber")
                ?.innerText.toLowerCase()
                .trim();
              action.cause = el
                .querySelector("#vMalpracticeJudgmentCause")
                ?.innerText.toLowerCase()
                .trim();
              action.judgementAmount = el
                .querySelector("#vMalpracticeJudgmentJudgmentAmount")
                ?.innerText.toLowerCase()
                .trim();
              action.issuedAt = el
                .querySelector("#vMalpracticeJudgmentDateIssued")
                ?.innerText.toLowerCase()
                .trim();
              action.info = el
                .querySelector("#vMalpracticeJudgmentAdditionalInformation")
                ?.innerText.toLowerCase()
                .trim();
            } else if (
              actionType ===
              "contentAdministrativeActionTakenbyOtherStateorFederalGovernment"
            ) {
              action.jurisdiction = el
                .querySelector(
                  "#vAdministrativeActionTakenbyOtherStateorFederalGovernmentJurisdiction"
                )
                ?.innerText.toLowerCase()
                .trim();
              action.description = el
                .querySelector(
                  "#vAdministrativeActionTakenbyOtherStateorFederalGovernmentDescriptionofAction"
                )
                ?.innerText.toLowerCase()
                .trim();
              action.date = el
                .querySelector(
                  "#vAdministrativeActionTakenbyOtherStateorFederalGovernmentDateofAction"
                )
                ?.innerText.toLowerCase()
                .trim();
            } else if (actionType === "contentAdministrativeCitationIssued") {
              action.citationNumber = el
                .querySelector("#vAdministrativeCitationIssuedCitationNumber")
                ?.innerText.toLowerCase()
                .trim();
              action.cause = el
                .querySelector("#vAdministrativeCitationIssuedCauseforCitation")
                ?.innerText.toLowerCase()
                .trim();
              action.fineAmount = el
                .querySelector("#vAdministrativeCitationIssuedFineAmount")
                ?.innerText.toLowerCase()
                .trim();
              action.resolvedAt = el
                .querySelector("#vAdministrativeCitationIssuedDateResolved")
                ?.innerText.toLowerCase()
                .trim();
              action.issuedAt = el
                .querySelector(
                  "#vAdministrativeCitationIssuedDateCitationIssued"
                )
                ?.innerText.toLowerCase()
                .trim();
            } else if (actionType === "contentMisdemeanorConviction") {
              action.court = el
                .querySelector("#vMisdemeanorConvictionCourt")
                ?.innerText.toLowerCase()
                .trim();
              action.docket = el
                .querySelector("#vMisdemeanorConvictionDocket")
                ?.innerText.toLowerCase()
                .trim();
              action.description = el
                .querySelector("#vMisdemeanorConvictionDescriptionofAction")
                ?.innerText.toLowerCase()
                .trim();
              action.sentence = el
                .querySelector("#vMisdemeanorConvictionSentence")
                ?.innerText.toLowerCase()
                .trim();
              action.effectiveAt = el
                .querySelector("#vMisdemeanorConvictionEffectiveDateofAction")
                ?.innerText.toLowerCase()
                .trim();
            }

            actions.push(action);
            el = document.getElementById(`${actionType}${++i}`);
          }
        }

        profile.actions = actions;

        return profile;
      }, profile);

      // console.log(deepProfile);
      profiles[license] = {
        ...profile,
        ...deepProfile,
        // fetch: false
      };
    }
  }

  const json = {
    ...data,
    deepLastRun: new Date(),
    profiles,
  };

  fs.writeFile("data/ca/temp.json", JSON.stringify(json), (error) => {
    if (error) throw error;
  });

  await browser.close();
})();
