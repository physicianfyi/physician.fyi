/**
 * Step 2: Cleans things found after the fact and merges scrape-deep and scrape-shallow
 */

import fs from "fs";

(async () => {
  const shallowData = JSON.parse(
    fs.readFileSync("data/ca/scrape-shallow.json", "utf8")
  );
  const shallowProfiles = shallowData.profiles;
  const deepData = JSON.parse(
    fs.readFileSync("data/ca/scrape-deep.json", "utf8")
  );
  const deepProfiles = deepData.profiles;

  for (let [, v] of Object.entries<any>(shallowProfiles)) {
    // Merge ones that there are only a few of and are same meaning as a more common one
    v.licenseStatus =
      {
        "delinquent - registration renewal fee has not been paid. no practice is permitted.":
          "delinquent - license renewal fee has not been paid. no practice is permitted.",
        "registration renewed & current": "license renewed & current",
        "registration surrendered": "license surrendered",
        "voluntary surrender": "license surrendered",
        "permit canceled": "license canceled",
        "registration revoked": "license revoked",
        "license current": "license renewed & current",
      }[v.licenseStatus as string] ?? v.licenseStatus;

    for (let i = 0; i < v.secondaryStatus.length; i++) {
      v.secondaryStatus[i] =
        {
          "probationary registration": "probationary license",
        }[v.secondaryStatus[i] as string] ?? v.secondaryStatus[i];
    }
  }

  for (let [, v] of Object.entries<any>(deepProfiles)) {
    for (let i = 0; i < (v.actions?.length ?? 0); i++) {
      v.actions[i].actionType =
        {
          contentAdministrativeDisciplinaryActions: "ADMINISTRATIVE DISCIPLINE",
          contentAdministrativeActionTakenbyOtherStateorFederalGovernment:
            "ACTION BY OTHER STATE OR FED",
          contentArbitrationAward: "ARBITRATION AWARD",
          contentFelonyConviction: "FELONY",
          contentMalpracticeJudgment: "MALPRACTICE JUDGEMENT",
          contentMisdemeanorConviction: "MISDEMEANOR",
          contentAdministrativeCitationIssued: "CITATION",
          contentHospitalDisciplinaryAction: "HOSPITAL DISCIPLINE",
          contentProbationaryLicense: "PROBATION",
          contentCourtOrder: "COURT ORDER",
          contentLICENSEISSUEDWITHPUBLICLETTEROFREPRIMAND:
            "PUBLIC LETTER OF REPRIMAND",
          contentMalpracticeSettlements: "MALPRACTICE SETTLEMENTS",
        }[v.actions[i].actionType as string] ?? v.actions[i].actionType;
    }
  }

  const profiles = Object.entries<any>(shallowProfiles).map(([k, v]) => {
    return {
      ...shallowProfiles[k],
      ...deepProfiles[k],
    };
  });

  const json = {
    cleanLastRun: new Date(),
    numProfiles: Object.keys(profiles).length,
    profiles,
  };

  fs.writeFile("data/ca/clean.json", JSON.stringify(json), (error) => {
    if (error) throw error;
  });
})();
