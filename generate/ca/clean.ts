/**
 * Step 2: Cleans things found after the fact, reformats data to be useful, and merges scrape-deep and scrape-shallow
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
          "delinquent",
        "delinquent - license renewal fee has not been paid. no practice is permitted.":
          "delinquent",
        "registration renewed & current": "license renewed & current",
        "registration surrendered": "license surrendered",
        "voluntary surrender": "license surrendered",
        "permit canceled": "license canceled",
        "registration revoked": "license revoked",
        "license current": "license renewed & current",
        "family support suspension": "emergency suspension",
      }[v.licenseStatus as string] ?? v.licenseStatus;

    for (let i = 0; i < v.secondaryStatus.length; i++) {
      v.secondaryStatus[i] =
        {
          "probationary registration": "probationary license",
        }[v.secondaryStatus[i] as string] ?? v.secondaryStatus[i];
    }

    // Other states only have one type of doctor license
    v.licenseType =
      {
        "physician and surgeon a": "medical doctor",
        "physician and surgeon g": "medical doctor",
        "physician and surgeon c": "medical doctor",
      }[v.licenseType as string] ?? v.licenseType;

    if (["n/a", "out of country state"].includes(v.state)) {
      delete v.state;
    }
    if (["n/a"].includes(v.county)) {
      delete v.county;
    }
    if (["n/a"].includes(v.zip)) {
      delete v.zip;
    }

    // Parsing name doesn't work for fictitious name permits
    // const name = v.name.split(",");
    // console.log(name);
    // v.lastName = name[0].trim();
    // v.firstName = name[1].trim().split(" ")[0];
    // const middleName = name[1].trim().split(" ")[1];
    // if (middleName) {
    //   v.middleName = middleName;
    // }
    // delete v.name;
  }

  for (let [, v] of Object.entries<any>(deepProfiles)) {
    for (let i = 0; i < (v.actions?.length ?? 0); i++) {
      v.actions[i].actionType = (
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
          "ORDER FOR LICENSE SURRENDER DURING ADIMINISTRATIVE ACTION":
            "ORDER FOR LICENSE SURRENDER DURING ADMINISTRATIVE ACTION",
        }[v.actions[i].actionType as string] ?? v.actions[i].actionType
      ).toLowerCase();

      v.actions[i].date = v.actions[i].date.replace(/3023$/, "2023");
    }

    // Remove medicine suffix since Florida data doesn't have it
    let school = v.school
      ?.replace(
        /((faculty|school|college) of (medicine( and surgery)?|physicians and surgeons))$/,
        ""
      )
      .trim();
    if (school === "david geffen school of medicine at ucla") {
      school = "university of california, los angeles";
    }
    if (school) {
      v.school = school;
    }

    // Get specialties from various fields
    let specialties = [];
    let primarySpecialty = v.survey?.["PRIMARY AREA OF PRACTICE"];
    if (
      ["OTHER - NOT LISTED", "DECLINE TO STATE"].includes(primarySpecialty) ||
      !primarySpecialty
    ) {
      primarySpecialty = null;
    }
    if (primarySpecialty) {
      specialties.push(primarySpecialty);
    }
    delete v.survey?.["PRIMARY AREA OF PRACTICE"];
    const secondSpecialties = v.survey?.["SECONDARY AREA OF PRACTICE"]?.filter(
      (p: string) =>
        !["DECLINE TO STATE", "NOT APPLICABLE", "OTHER - NOT LISTED"].includes(
          p
        )
    );
    if (secondSpecialties) {
      specialties.push(...secondSpecialties);
    }
    delete v.survey?.["SECONDARY AREA OF PRACTICE"];
    const certifications = v.survey?.["ABMS CERTIFICATIONS"]?.filter(
      (p: string) => !["OTHER - NONE", "OTHER - DECLINE TO STATE"].includes(p)
    );
    if (certifications) {
      for (let c of certifications.map((c: string) =>
        c.replace(/^.*-/, "").trim()
      )) {
        if (!specialties.includes(c)) {
          specialties.push(c);
        }
      }
    }
    delete v.survey?.["ABMS CERTIFICATIONS"];

    specialties = specialties.map((s) => {
      if (s === "ORTHOPEDIC SURGERY") {
        // Florida uses this
        return "ORTHOPAEDIC SURGERY";
      }
      return s;
    });
    specialties = Array.from(new Set(specialties));

    if (specialties.length) {
      v.specialties = specialties;
    }

    const activities = v.survey?.["PRACTICE ACTIVITIES"];
    if (activities) {
      let numHours = 0;
      let minActivities: any = {};
      for (let [k, v] of Object.entries<any>(activities)) {
        if (
          [
            "ADMINISTRATION",
            "DIRECT PATIENT CARE (INCLUDING TELEHEALTH)",
            "OTHER",
            "RESEARCH",
            "TRAINING",
          ].includes(k)
        ) {
          const hours = Number(v.match(/^[0-9]{1,2}/)?.[0] ?? 0);
          numHours += hours;
          minActivities[k] = hours;
        }
      }
      if (numHours) {
        v.minHours = numHours;
        v.minActivities = minActivities;
      }
    }
  }

  const profiles = Object.fromEntries(
    Object.entries<any>(shallowProfiles).map(([k, v]) => {
      return [
        k,
        {
          ...shallowProfiles[k],
          ...deepProfiles[k],
        },
      ];
    })
  );

  const json = {
    // Has lastRun dates
    ...shallowData,
    ...deepData,
    cleanLastRun: new Date(),
    numProfiles: Object.keys(profiles).length,
    profiles,
  };

  fs.writeFile("data/ca/clean.json", JSON.stringify(json), (error) => {
    if (error) throw error;
  });
})();
