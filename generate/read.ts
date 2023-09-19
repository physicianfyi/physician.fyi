/**
 * Gets causes for discipline from documents that are type Decision
 */

import fs from "fs";

const SOURCE_DIR = "public/txts/";

(async () => {
  const files = fs.readdirSync(SOURCE_DIR);
  const errors: any = {};
  const results: any = {};

  await Promise.all(
    files.map(async (file) => {
      if (!file.endsWith(".txt")) {
        return;
      }

      const text = fs.readFileSync(`${SOURCE_DIR}${file}`, "utf8");
      // JS doesn't have ungreedy flag https://stackoverflow.com/a/364029/9703201
      const regexp = /causes?\sfor\sdiscipline(.*?)\((.*?)[)>]/gis;
      const causes = [...text.matchAll(regexp)]
        // Filter the full match's length, not just the group
        .filter((r) => r[0].length < 100)
        // Sometimes all caps, others title case
        .map((r) => r[2].toLowerCase())
        .filter((r) => r && r.length > 3)
        .map((r) =>
          r
            ?.replaceAll("discipliné", "discipline")
            .replaceAll("piscipline", "discipline")
            .replaceAll("tllness", "illness")
            .replaceAll(/[\s\n]+/g, " ")
            .replaceAll("repea'ted", "repeated")
            .replaceAll("inéurance", "insurance")
            .replaceAll("’", "'")
            .replaceAll("inccm:petence", "incompetence")
            .replace(/out[\s-]of[\s-]state/, "out-of-state")
            .replace(/;$/, "")
            .replaceAll("l_tnud", "fraud")
            .replaceAll(/\s[0-9]+\s[|]+[\s]*/g, " ")
            .replaceAll(" ox 14 ", " or ")
            .replaceAll("pactients", "patients")
            .replaceAll("contxrolled", "controlled")
            .replace("incompe[en;:e", "incompetence")
            .replaceAll("crimé", "crime")
            .replaceAll("neéligence", "negligence")
            .replaceAll("fntries", "entries")
            .replaceAll("al:ex‘:ing", "altering")
            .replaceAll(" seif ", " self ")
            .replaceAll("incompetehce", "incompetence")
            .replaceAll("impaixment", "impairment")
            .replaceAll("insuxaru:e", "insurance")
            .replaceAll("negli_gence", "negligence")
            .replace(/^remme$/, "revocation or suspension by another state")
            .replaceAll("unprofessionai", "unprofessional")
            .replaceAll("l;rescribing", "prescribing")
            .replaceAll("ncgligence", "negligence")
            .replaceAll("sexualmisconduct", "sexual misconduct")
            .replaceAll("out -of- state", "out-of-state")
            .replaceAll("addiée", "addict")
            .replace(/ aci:s$/, " acts")
            .replaceAll("self use", "self-use")
            .replaceAll(" of;cn'me", " of a crime")
            .replace(/^ncompetence/, "incompetence")
            .replace(/ act\(s$/, " acts")
            .replace(/ prescribin 2$/, " prescribing")
            .replaceAll(" drué ", " drug ")
            .replaceAll("inéompetence", "incompetence")
            .replaceAll("negliéence", "negligence")
            .replace(/^ncompeience$/, "incompetence")
            .replaceAll("lncompeience", "incompetence")
            .replaceAll("dishon'esucorrupt acts", "dishonest/corrupt acts")
            .replace(/ practic<$/, " practice")
            .replace(/ étate$/, " state")
            .trim()
        );
      // Length greater than 3 handles cases where parentheses around offense were not there like in A1FERUOB—these will be gotten in next step where we look for known offenses in all documents

      // Note "business and professions code § 2234 (e" with letter at end are missing end parentheses but no biggie

      if (causes.length) {
        results[file] = causes;
      }

      // TODO Write to copy of ca.json then run format on that
    })
  );

  fs.writeFile(
    "data/read.json",
    JSON.stringify({
      lastRun: new Date(),
      results,
      errors,
    }),
    (error) => {
      if (error) throw error;
    }
  );

  const data = JSON.parse(fs.readFileSync("data/ca.json", "utf8"));

  for (let i = 0; i < data.results.length; i++) {
    const offenses = results[`${data.results[i][" "]}.pdf.txt`];
    if (offenses) {
      data.results[i]["Offenses"] = offenses;
    }
  }

  fs.writeFile("data/ca-with-offenses.json", JSON.stringify(data), (error) => {
    if (error) throw error;
  });
})();
