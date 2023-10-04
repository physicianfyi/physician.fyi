/**
 * Deep scrape of Department of Consumer Affairs advanced search, which contains both medical board documents/actions as well as 3rd-party actions like settlements above 30k reported to the medical board
 */

import puppeteer from "puppeteer";
import fs from "fs";

(async () => {
  const data = JSON.parse(fs.readFileSync("data/ca/scrape.json", "utf8"));
  const profiles = data.profiles;

  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });

  for (let [license, profile] of Object.entries<any>(profiles).slice(0, 10)) {
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
          profile.address2 = address[1].replace(/,\s*$/, "");

          // eg, https://search.dca.ca.gov/details/8002/A/49264/a8e99b012afe9a60eaad770f9df71238
          if (address?.[2] && !address[2].startsWith(baseProfile.city)) {
            profile.address3 = address[2].replace(/,\s*$/, "");
          }
        }

        profile.probationSummary = (
          document.querySelector(
            ".detailContainer > p > span > string[xmlns='http://schemas.microsoft.com/2003/10/Serialization/']"
          ) as any
        )?.innerText;

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
          // TODO court order, probationary license, hospital disciplinary action, license issued with public letter of reprimand, malpractice settlements (not judgement)
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
              // TODO Need to replace new lines with spaces due to https://search.dca.ca.gov/details/8002/G/80280/87ba922ecbb7f2f40a355f0263059fc9
              action.description = el
                .querySelector("#vAdministrativeDisciplinaryActionsDescription")
                ?.innerText.toLowerCase()
                .trim();
              action.date = el
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
              action.date = el
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
              action.date = el
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
              action.date = el
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
              // Name every date the same for charting
              action.date = el
                .querySelector("#vMisdemeanorConvictionEffectiveDateofAction")
                ?.innerText.toLowerCase()
                .trim();
            }

            actions.push(action);
            el = document.getElementById(`${actionType}${++i}`);
          }
        }

        const documents = Array.from<any>(
          document.querySelectorAll(
            "#PublicDocuments > nav > section > div.prabox-content > ul > li"
          )
        );
        for (let i = 0; i < documents.length; i += 3) {
          const action: any = {};
          action.actionType = documents[i].querySelector("span > a").innerText;
          action.url = documents[i]
            .querySelector("span > a")
            .getAttribute("href")
            // Match format we already used
            .replace("/BreezePDL/", "/PDL/");
          action.date = documents[i + 1]
            .querySelector("span:not(.detailHeader)")
            .innerText.toLowerCase()
            .trim();
          action.numPages = Number(
            documents[i + 2]
              .querySelector("span:not(.detailHeader)")
              .innerText.toLowerCase()
              .trim()
          );
          actions.push(action);
        }

        profile.actions = actions;

        // Survey info
        const questions = Array.from<any>(
          document.querySelectorAll("#SurveyInformation > div.survQuestion")
        );
        const answers = Array.from<any>(
          document.querySelectorAll("#SurveyInformation > div.survAnswer")
        );

        const survey: any = {};
        for (let i = 0; i < questions.length; i++) {
          const question = questions[i].innerText;
          let answer = answers[i].innerText.replace(/\s*$/, "");
          if (question === "POSTGRADUATE TRAINING YEARS") {
            answer = Number(answer);
          } else if (question === "LANGUAGE FLUENCY") {
            answer = answer.split("\n");
          } else if (question === "PRACTICE ACTIVITIES") {
            answer = answer.split("\n").reduce((acc: any, curr: any) => {
              const [k, v] = curr.split(" - ");
              acc[k] = v;
              return acc;
            }, {});
          }
          survey[questions[i].innerText] = answer;
        }
        profile.survey = survey;

        return profile;
      }, profile);

      // console.log(deepProfile);
      profiles[license] = {
        ...profile,
        ...deepProfile,
        fetch: false,
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
