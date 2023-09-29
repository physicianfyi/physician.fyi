/**
 * Gets causes for discipline from documents that are type Decision
 */

import fs from "fs";
// Doesn't have suggestions for some like 'fmpairment'
import SpellChecker from "simple-spellchecker";

const SOURCE_DIR = "public/txts/";

(async () => {
  const files = fs.readdirSync(SOURCE_DIR);
  const errors: any = {};
  const results: any = {};

  // SpellChecker.getDictionary("en-US", function (err: any, dictionary: any) {
  //   if (!err) {
  //     var misspelled = !dictionary.spellCheck("fmpairment");
  //     if (misspelled) {
  //       var suggestions = dictionary.getSuggestions("fmpairment");
  //       console.log(suggestions);
  //     }
  //   }
  // });

  await Promise.all(
    files.map(async (file) => {
      if (!file.endsWith(".txt")) {
        return;
      }

      const text = fs.readFileSync(`${SOURCE_DIR}${file}`, "utf8");
      // JS doesn't have ungreedy flag https://stackoverflow.com/a/364029/9703201
      // TODO Use cause for action too https://web.archive.org/web/20230923000923/https://www2.mbc.ca.gov/PDL/document.aspx?path=%5CDIDOCS%5C20230131%5CDMRAAAJD4%5C&did=AAAJD230131222900356.DID
      const regexp = /causes?\sfor\sdiscipline(.*?)\((.*?)[)>]/gis;
      const causes = [...text.matchAll(regexp)]
        // Filter the full match's length, not just the group
        .filter((r) => r[0].length < 100)
        // Sometimes all caps, others title case
        .map((r) => r[2].toLowerCase())
        .filter((r) => r && r.length > 3)
        .map((r) =>
          r
            // Replace multi-spaces with single spaces https://stackoverflow.com/a/1981366/9703201
            ?.replace(/\s\s+/g, " ")
            .replace(/--+/g, "-")
            .replace(/-—+/g, "-")
            .replace(/—-+/g, "-")
            .replaceAll("discipliné", "discipline")
            .replaceAll("piscipline", "discipline")
            .replaceAll("tllness", "illness")
            .replaceAll(/[\s\n]+/g, " ")
            .replaceAll("repea'ted", "repeated")
            .replaceAll("inéurance", "insurance")
            .replaceAll("negligcnce", "negligence")
            .replaceAll("’", "'")
            .replaceAll("inccm:petence", "incompetence")
            .replace(/out[\s-]of[\s-]state/, "out-of-state")
            .replace(/;$/, "")
            .replaceAll("l_tnud", "fraud")
            .replaceAll(/\s[0-9]+\s[|]+[\s]*/g, " ")
            .replaceAll(" ox 14 ", " or ")
            .replaceAll("contxrolled", "controlled")
            .replaceAll("failu}e ", "failure ")
            .replace("incompe[en;:e", "incompetence")
            .replaceAll("ux;professional ", "unprofessional ")
            .replaceAll("inaﬂcquate ", "inadequate ")
            .replaceAll("crimé", "crime")
            .replaceAll("neéligence", "negligence")
            .replace(/^l.ucompetence$/, "incompetence")
            .replaceAll(" negligenge", " negligence")
            .replaceAll(" neg! 1gent ", " negligent ")
            .replace(/^nadequaterecordkeeping$/, "inadequate recordkeeping")
            .replaceAll("fntries", "entries")
            .replaceAll("al:ex‘:ing", "altering")
            .replaceAll(" seif ", " self ")
            .replaceAll("incompetehce", "incompetence")
            .replaceAll("impaixment", "impairment")
            .replaceAll(" fmpairment", " impairment")
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
            .replaceAll("negligenee", "negligence")
            .replaceAll("violation:of ", "violation of ")
            .replace(/ étate$/, " state")
            .replace(
              "13 _ (lack of physician supervision",
              "lack of physician supervision"
            )
            .replaceAll("mediéine", "medicine")
            .replaceAll("negliéent", "negligent")
            .replaceAll("f}\\lluré", "failure")
            .replaceAll("mannér", "manner")
            .replaceAll("patiept ", "patient ")
            .replace(
              /^convlctlorn ofa substnntiﬂl$/,
              "conviction of a substantially related crime"
            )
            .replace(/^unpi‘cféssii$/, "unprofessional conduct")
            .replaceAll(" conducf", " conduct")
            .replaceAll(" conduet", " conduct")
            .replaceAll(" condlict", " conduct")
            .replaceAll("exccssive ", "excessive ")
            .replaceAll(" negliceani ", " negligent ")
            .replaceAll(" aéts", " acts")
            .replaceAll(" mediéal ", " medical ")
            .replaceAll(" [njuriou‘s ", " injurious ")
            .replace(/^inéumpetcnee$/, "incompetence")
            .replace(/^chénted /, "repeated ")
            .replaceAll(" neg[;gence ", " negligence ")
            .replaceAll(" enother ", " another ")
            .replaceAll("unpiofessional", "unprofessional")
            .replaceAll("unprofessim‘ml", "unprofessional")
            .replace(/^ulegitimate /, "illegitimate ")
            .replace(/ récon_is$/, " records")
            .replace(/^lnad'equate /, "inadequate ")
            .replaceAll("unprofessio};al cund{lct", "unprofessional conduct")
            .replace(/^repeﬁtéd /, "repeated ")
            .replaceAll("n eéligence", "negligence")
            .replaceAll("négligen(", "negligent")
            .replaceAll(" ne'gligence", " negligence")
            .replaceAll(" tomtrolled ", " controlled ")
            .replaceAll("rep.teated ", "repeated ")
            .replace(/^grosé /, "gross")
            .replaceAll("gross: negligence ", "gross negligence ")
            .replaceAll(" abetﬁné ", " abetting ")
            .replaceAll("unprofessicnal ", "unprofessional ")
            .replaceAll("l'atient' ", "patient ")
            .replaceAll(" patifnt ", " patient ")
            .replace(/^ilegal use of alcoliol$/, "illegal use of alcohol")
            .replace(
              /^ch'calud n_l*gli;lcil\( acts$/,
              "repeated negligent acts"
            )
            .replace(
              /^prescribing a e;imgel'uus dlug without' appropriate . -$/,
              "prescribing a dangerous drug without appropriate examination and medical indication"
            )
            .replace(
              /^railureto maintan adequatc records$/,
              "failure to maintain adequate records"
            )
            .replace(
              /^prescribing dangerous drugs 2 without a good %aith %rior examgmation$/,
              "prescribing dangerous drugs without a good faith prior examination"
            )
            .replaceAll(" [liness ", "illness")
            .replaceAll("éestriction", "restriction")
            .replaceAll("aidiné ", "aiding ")
            .replaceAll("repeéted ", "repeated ")
            .replace(/^iucompetenée$/, "incompetence")
            .replaceAll("repésted ", "repeated ")
            .replaceAll(" crimix‘:ai ", " criminal ")
            .replaceAll(" éonduct", " conduct")
            .replaceAll(" negliéeut ", " negligent ")
            .replaceAll(" subétances", " substances")
            .replaceAll("presé‘ribing ‘without ", "prescribing without ")
            .replaceAll(" neéligent ", " negligent ")
            .replaceAll("unprofeésional", "unprofessional")
            .replaceAll(" corrl.;pé ", " corrupt ")
            .replaceAll(" l(?&ntrolléd ", " controlled ")
            .replaceAll(" stéte", " state")
            .replaceAll(" meéical ", " medical ")
            .replaceAll("neéli gent ", "negligent ")
            .replaceAll(" co‘nvictian--?osseésion ", " conviction--possession ")
            .replaceAll(" negng'.;nce", " negligence")
            .replaceAll("unpmfessionnl ", "unprofessional ")
            .replaceAll(" iliness", " illness")
            .replaceAll("iliness ", "illness ")
            .replaceAll(" stand;lrds ", " standards ")
            .replaceAll(" cotruption", " corruption")
            .replaceAll(" cox{duct", " conduct")
            .replaceAll(" i'rescribipg ", " prescribing ")
            .replaceAll(" ma‘inmin ", " maintain ")
            .replaceAll("repeate;‘l ", "repeated ")
            .replaceAll(" adeqllnte‘ ", " adequate ")
            .replace(/^e;ross negligence$/, "gross negligence")
            .replaceAll(" aceurate ", " accurate ")
            .replaceAll(" re‘.:ords", " records")
            .replaceAll("f: ‘ailure fo ", "failure to ")
            .replace(/^incnmpe‘tence$/, "incompetence")
            .replace(/ ac‘s$/, " acts")
            .replaceAll(" ll‘mvolving ", " involving ")
            .replace(/^fﬂilure‘to /, "failure to ")
            .replaceAll(" o;‘. ", " of ")
            .replaceAll(' unpl"ol‘msionul ', " unprofessional ")
            .replaceAll(" actsﬁul‘nrgngcmt", " acts of negligence")
            .replace(/^ch'ca‘lud n_l*gli‘;lcil\( /, "repeated negligent ")
            .replace(
              / e;imgel'uus dl‘ug without' appropriate . -^/,
              " dangerous drug without appropriate examination and medical indication"
            )
            .replaceAll(" l‘l ", " a ")
            .replaceAll(" negl‘igenca‘", " negligence ")
            .replaceAll(" nbgligcncc.", " negligence ")
            .replace(/ aew$/, " acts")
            .replace(/^i“urnis]‘ling /, "furnishing ")
            .replaceAll(" negli;em ", " negligent ")
            .replace(
              /^gr.oss negllgcnee\/llnpro?egnlunal /,
              "gross negligence/unprofessional "
            )
            .replaceAll(" ”i‘ouch_ing ", " touching ")
            .replaceAll("re‘?eated ", "repeated ")
            .replaceAll(" n egligence‘", " negligence")
            .replaceAll("g;—uss ", "gross ")
            .replaceAll(" dishbnesty", " dishonesty")
            .replaceAll(" a‘deqliate ", " adequate ")
            .replaceAll(" adequ:‘ne ", " adequate ")
            .replaceAll(" kecords", " records")
            .replaceAll(" negliger'xt‘acts", " negligent acts")
            .replaceAll(" to‘mninmin ", " to maintain ")
            .replace(/^repented‘n'egligent /, "repeated negligent ")
            .replace(/ inacc_llrﬂtevk'ecbl‘d's-$/, " inaccurate records")
            .replace(/ ata sui‘jject !nte'rview$/, " at a subject interview")
            .replace(/^prescr}bing /, "prescribing ")
            .replaceAll(" securl‘iy ", " security ")
            .replace(/ ].ndicau‘on$/, " indication")
            .replaceAll(" convolled ", " controlled ")
            .replaceAll("»", " ")
            .replaceAll(" 7o ", " to ")
            .replaceAll(" xllness ", " illness ")
            .replaceAll("lliegitimate ", "illegitimate ")
            .replaceAll("violatton ", "violation ")
            .replaceAll("vinlating ", "violating ")
            // Doesn't work for "...in violation of..."
            // .replaceAll("violation of ", "violating ")
            .replaceAll("ﬁrescribing ", "prescribing ")
            .replaceAll(" fraﬁd", " fraud")
            .replaceAll(" aleohol", " alcohol")
            .replaceAll(" neglient ", " negligent ")
            .replaceAll(" maintnin ", " maintain ")
            .replaceAll("cdnviction ", "conviction ")
            .replaceAll("se{mal ", "sexual ")
            .replaceAll(" corﬁptlon", " corruption")
            .replaceAll("recorq ", "record ")
            .replaceAll(" negligentacts", " negligent acts")
            .replaceAll(" _limi(ation ", " limitation ")
            .replaceAll(" com:iuct", " conduct")
            .replace(
              /^gross negliger;ce, i'atiems 1,2,3,4,&5$/,
              "gross negligence"
            )
            .replace(/^di§h6nesty$/, "dishonesty")
            .replaceAll("unprofesﬁona[ ", "unprofessional ")
            .replaceAll(" negiigence", " negligence")
            .replaceAll("repsated ", "repeated ")
            .replaceAll("repeatsd ", "repeated ")
            .replaceAll("failore ", "failure ")
            .replaceAll("dishonesi: ", "dishonest ")
            .replaceAll(" ” ", " ")
            .replaceAll("unpmfe;sional ", "unprofessional ")
            .replaceAll(" negligenn_e", " negligence")
            .replaceAll(" negligeqt ", " negligent ")
            .replaceAll("inad'equate ", "inadequate ")
            .replaceAll("comniission ", "commission ")
            .replaceAll("dishenest ", "dishonest ")
            .replaceAll(" nogligenco", " negligence")
            .replaceAll(" adequntc ", "adequate ")
            .replaceAll(" adegquate ", " adequate ")
            .replaceAll("u.nprofessionul ", "unprofessional ")
            .replaceAll(" unprofessinnal ", " unprofessional ")
            .replaceAll(" ;\\ccurate ", " accurate ")
            .replaceAll(" aots ", " acts ")
            .replaceAll(" negﬁgent ", " negligent ")
            .replaceAll(" negligeqce", " negligence")
            .replaceAll(" negligen c'e", " negligence")
            .replaceAll(" concerni;xg ", " concerning ")
            .replaceAll("regeated ", "repeated ")
            .replaceAll("repcated ", "repeated ")
            .replaceAll(" nag;itgence", " negligence")
            .replaceAll(" maiotain ", " maintain ")
            .replaceAll("genera.l'unprofessional ", "general unprofessional ")
            .replaceAll("genera! ", "general ")
            .replaceAll(" xeeping", " keeping")
            .replaceAll(" cpnduct", " conduct")
            .replaceAll(" adeq_unte ", "adequate ")
            .replaceAll(" neg_ligence", " negligence")
            .replaceAll(" bonduct", " conduct")
            .replaceAll(" xlness ", " illness ")
            .replaceAll(" neglfgence", " negligence")
            .replace(/^incumpetence$/, "incompetence")
            .replaceAll(" noegligent ", " negligent ")
            .replaceAll("fail-ure ", "failure ")
            .replace(/^gross'negligence$/, "gross negligence")
            .replaceAll("genernl ", "general ")
            .replace(/^dishone_sly$/, "dishonesty")
            .replaceAll(" cm;duct", " conduct")
            .replaceAll("paticnt", "patient")
            .replaceAll(" conwrolled ", " controlled ")
            .replaceAll(" patisnt ", " patient ")
            .replaceAll("practice o medicine", "practice of medicine")
            .replaceAll("failure o maintain", "failure to maintain")
            .replaceAll(" pat_ient ", " patient ")
            .replaceAll("gruss ", "gross ")
            .replaceAll(" patien: ", " patient ")
            .replaceAll(" pauent ", " patient ")
            .replaceAll(" paticut ", " patient ")
            .replaceAll("fuilure ", "failure ")
            .replaceAll(" pafient ", " patient ")
            .replaceAll("tnability ", "inability ")
            .replaceAll("dishoncsty ", "dishonesty ")
            .replaceAll("ilegal ", "illegal ")
            .replaceAll(" (o", " to")
            .replaceAll(" practicc", " practice")
            .replaceAll("preseribing ", "prescribing ")
            .replaceAll("out -of-state ", "out-of-state ")
            .replaceAll("repeatea ", "repeated ")
            .replaceAll("insﬁrance ", "insurance ")
            .replaceAll("generavl ", "general ")
            .replace(/^repented negligence$/, "repeated negligence")
            .replace(
              /^useof alcoholic bevetages in a dangerous,manner$/,
              "use of alcoholic beverages in a dangerous manner"
            )
            .replaceAll(" pracﬂ.ce act", " practice act")
            .replaceAll(" excossive ", " excessive ")
            .replaceAll(" ade;;uate ", " adequate ")
            .replace(/^u mprofessional /, "unprofessional ")
            .replaceAll(" n egligent ", " negligent ")
            .replaceAll(" a!cohnl ", " alcohol ")
            // AAAHL210713203823970.DID.pdf
            .replace(
              /^discipline, restriction, or limimtl$/,
              "discipline, restriction, or limitation imposed by another state"
            )
            .replace(/^incumpctcnce$/, "incompetence")
            .replaceAll(" patiem ", " patient ")
            .replaceAll(" petient ", " patient ")
            .replace(/^incmnpetence$/, "incompetence")
            .replaceAll("unprofessio;lnl ", "unprofessional ")
            .replace(/^excessiveprescribing$/, "excessive prescribing")
            .replaceAll(" usc ", " use ")
            .replaceAll("convii:tion ", "conviction ")
            .replaceAll("bxcessive ", "excessive")
            .replaceAll(" i11 ", " ill ")
            .replaceAll(" excessive.diagnostic ", " excessive diagnostic ")
            .replaceAll("repezted ", "repeated ")
            .replaceAll(" suﬁstantiaily ", " substantially ")
            .replaceAll("violation'of ", "violation of ")
            .replaceAll(" limih;tions ", " limitations ")
            .replaceAll(" adequate.and ", " adequate and ")
            .replaceAll("fail;lre ", "failure ")
            .replaceAll("repeateq ", "repeated ")
            .replaceAll(" a.crime", " a crime")
            .replace(/^[a-zA-Z]+ cause for discipline$/, "")
            .replaceAll(" negligpuce", " negligence")
            .replace(/^incompetwce$/, "incompetence")
            .replaceAll("violatiun ", "violation ")
            .replaceAll("exces.sive ", "excessive ")
            .replaceAll(" prt;scripﬁons", " prescriptions")
            .replaceAll(" patierits", " patients")
            .replaceAll(" practice ac't", " practice act")
            .replace(
              /^i;shonesta—nd cor;lipt act$/,
              "dishonest and corrupt act"
            )
            .replace(/^nadequate /, "inadequate ")
            .replaceAll("rep eateleegligent ", "repeat negligent ")
            .replaceAll("in_accllrste ", "inaccurate ")
            .replaceAll(" substa;nﬁally ", " substantially ")
            .replaceAll("unprufesslonal ", "unprofessional ")
            .replaceAll(" neﬁllgence", " negligence")
            .replaceAll(
              "commission cf'avcts tnvolving ",
              "commission of acts involving "
            )
            .replace(/^rspcated negligence$/, "repeated negligence")
            .replace(/^incompelence$/, "incompetence")
            .replaceAll(" neg]igiml ", " negligent ")
            .replace(/^gross negligene?$/, "gross negligence")
            .replaceAll(" negl'igent ", " negligent ")
            .replaceAll("unprofessiona! ", "unprofessional ")
            .replaceAll("iliegal ", "illegal ")
            .replaceAll(" _involving ", " involving ")
            .replaceAll(" inﬂucnce", " influence")
            .replaceAll("i,inprofessional ", "unprofessional ")
            .replaceAll(" represent;lions", " representations")
            .replaceAll(" recordkecping", " recordkeeping")
            .replaceAll("viulatio.n ", "violation ")
            .replaceAll("generﬂ ", "general ")
            .replace(/ pay finc$/, " pay fine")
            .replaceAll(" neghigent ", " negligent ")
            .replaceAll(" in @ ", " in a ")
            .replace(
              /^faillire to maintain adequate and accurate medicsl recoriis$/,
              "failure to maintain adequate and accurate medical records"
            )
            .replaceAll("unprorml(ml ", "unprofessional ")
            .replaceAll(" aciver«islng", " advertising")
            .replace(
              /^dis;hcnest and corrupt-acts$/,
              "dishonest and corrupt acts"
            )
            .replaceAll("impaj:ed ", "impaired ")
            .replace(
              /^discipline, restriction, or limitation lmpc.$/,
              "discipline, restriction, or limitation imposed by another state"
            )
            .replaceAll(" neingence", " negligence")
            .replaceAll("coaviction ", "conviction ")
            .replace(/^ise /, "use ")
            .replaceAll(" impzired", " impaired")
            .replaceAll(" tllegal", " illegal")
            .replaceAll("conviction of ¢ crime", "conviction of a crime")
            .replaceAll(" ncglignt -_aets", " negligent acts")
            .replaceAll(" issuancc ", " issuance ")
            .replace(/^grossnegligemee$/, "gross negligence")
            .replaceAll(" neghgence", " negligence")
            .replaceAll("viclation ", "violation ")
            .replaceAll(" anothr statc", " another state")
            .replaceAll(" !\\iegligcncc", " negligence")
            .replaceAll(" negligen;:e", " negligence")
            .replaceAll("pres:cdbing ", "prescribing ")
            .replaceAll(" and/orrincompetence", " and/or incompetence")
            .replaceAll("repea(ed ", "repeated ")
            // Remove "unprofessional conduct" prefix; this is needed before the "patient" logic for "unprofessional conduct- patient abuse"
            // Preserve "general unprofessional conduct - patient s.c."
            .replace(
              /^unprofessional conduct(: |; |, | ~ |\s?—\s?|\s?\/\s?|\s?-\s?| \()/,
              ""
            )
            .replaceAll("pactients", "patients")
            .replaceAll("pétients", "patients")
            .replaceAll(": patient e: ", ": ")
            // Remove patients suffixes
            .replace(/(\s?-\s?|:\s|\s)(all|both) patients(\.)?$/, "")
            // Preserve ": patient privacy" and ": patient autonomy over home health care decisions"
            .replace(
              /(( re)?(:\s?| )|\s?(-|,|—|;|~)\s?| in (the )?((ca(r|s)e|treatment)|care and treatment) of | as to | for | concerning | pertaining to )((patient(s?)|pt\.|victim)(\s|\.)(?!(privacy|autonomy|records))([\dA-Za-z\-'.\s,&[\\"%$;:_\]*?]{1,})|\d patients)$/,
              ""
            )
            // Remove patient prefix
            // https://stackoverflow.com/a/2013172/9703201
            .replace(/^patient(s)?(.*?)(-|:|~)/, "")
            // After removing patient prefix and suffix, remove any standalone patients
            .replace(
              /^patient(?!.*(abuse|privacy|autonomy|abandonment)).*$/,
              ""
            )
            .trim()
            // Any ones looking from start to end must come after removing parts of other strings
            .replace(/^inccmpeteace$/, "incompetence")
            .replace(/^dishonest.acts$/, "dishonest acts")
            .replace(/^grossnegligence$/, "gross negligence")
            .replace(/^dbrug abuse$/, "drug abuse")
            .replace(/^dishonefty$/, "dishonesty")
            // Remaining back ticks are superfluous
            .replaceAll("‘", "")
            .replaceAll("“", "")
            .replaceAll("”", "")
            // Unaccent any leftover accented characters
            // https://stackoverflow.com/a/37511463/9703201
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            // Now group similar offenses
            .replace(
              /^general unprofessional conduct$/,
              "unprofessional conduct"
            )
            .replace(
              /^failure to maintain adequate( and |\/)accurate (medical )?records$/,
              "inadequate and inaccurate records"
            )
            .replace(
              /^inadequate and( |.)inaccurate( |.)(medical )?records$/,
              "inadequate and inaccurate records"
            )
            .replace(
              /^adequate\/accurate records$/,
              "inadequate and inaccurate records"
            )
            .replace(
              /^failure to maintain adequate (medical )?records$/,
              "inadequate records"
            )
            .replace(/^(inadequate )?record keeping$/, "inadequate records")
            .replace(/^inaccurate medical records$/, "inaccurate records")
            .replace(/^making false statements$/, "false statements")
            // https://www.senate.gov/pagelayout/legislative/one_item_and_teasers/Laws_and_Acts_page.htm
            // Covers singular and plural
            .replaceAll(" statute", " law")
            .replaceAll(" laws regulating drugs", " drug laws")
            .replaceAll(" law regulating drugs", " drug law")
            .replace(/^dishonesty$/, "dishonesty or corruption")
            .replace(/^dishonest or corrupt acts$/, "dishonesty or corruption")
            .replace(/^dishonest acts$/, "dishonesty or corruption")
            .replace(/^dishonesty\. or corruption$/, "dishonesty or corruption")
            .replaceAll("record-keeping", "recordkeeping")
            .replaceAll("record keeping", "recordkeeping")
            .replace(
              /^((\()?discipline, restriction(s)?(,|;|\.) or limitation(s)? imposed by (another state|other states)|out-of-state discipline|restriction, or limitation imposed by (another state|other states))$/,
              "out-of-state discipline, restriction, or limitation"
            )
            .replace(
              /^((\()?discipline, restriction(s)?(,|;|\.) or limitation(s)?(\.)? imposed by( a)? federal (government|agency)|(discipline|(disciplinary )?action)( taken| imposed)? by( a|( an)? agency of the)? federal (government|agency))$/,
              "federal discipline, restriction, or limitation"
            )
            .replace(
              /(negligen(t|ce)(\s|.)act(s)?|acts of negligence)/,
              "negligence"
            )
            .replaceAll("repeated ", "repeat ")
            .replace(
              /^(act( or acts)? of dishonesty or corruption|dishonest or corrupt act|corrupt or dishonest acts|(engaging in )?dishonest and\/or corrupt acts|acts o(f|r) dishonesty (and\/)?or corruption|(commission of (any )?)?act(s?) involving dishonesty or corruption|commission of dishonest or corrupt acts|corruption|dishonest conduct)$/,
              "dishonesty or corruption"
            )
            .replace(
              /^(dishonest and corrupt act(s)?|acts of dishonesty and corruption|corrupt( and |\/)dishonest acts|acts involving dishonesty and corruption|dishonest\/corrupt act(s)?|dishonesty\/corruption)$/,
              "dishonesty and corruption"
            )
            .replace(/^corrupt acts$/, "corruption")
            .replace(
              /^(acts (of|involving) dishonesty|commission of (dishonest acts|acts (involving|of) dishonesty))$/,
              "dishonesty"
            )
            // Remove trailing —
            .replace(/ (—|-)$/, "")
        )
        // Filter out empty strings
        .filter((c) => c && !["facts"].includes(c));
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
