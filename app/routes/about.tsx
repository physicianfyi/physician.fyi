import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";

export default function Route() {
  const posthog = usePostHog();
  useEffect(() => {
    posthog?.capture("$pageview");
  }, [posthog]);

  return (
    <article className="p-8 prose dark:prose-invert mx-auto">
      <h1>About</h1>

      <p>
        Only after experiencing medical malpractice did I begin to realize just
        how frequently it occurs and that most patients are not aware of how to
        look up a doctor's history or take recourse when victimized. A big part
        of this is because doctors and their stakeholders fiercely suppress
        cases against them. Doctors offer refunds in exchange for signing a gag
        clause (i.e., non-disclosure/disparagement agreement) barring the victim
        from ever talking about it. If the victim is within the statute of
        limitations (which is very short in some states, like California's 1
        year due to MICRA) and they sue, doctors carry hefty malpractice
        insurance that coerces settlement with victims out of court, once again
        stipulating that they not speak. If those methods don't work, doctors
        hire reputation cleaners to get unfavorable reviews taken down directly
        by the review platform or by threat of lawsuit over libel.
      </p>

      <p>
        Many victims don't know they can file a complaint with the doctor's
        licensing body (the state medical board). However, even if the victim
        does file a complaint, the complaint process is very opaque. Medical
        boards have a history of going very easy on doctors, perhaps because
        they are governed by a majority doctors (
        <a
          href="https://www.mbc.ca.gov/about/members/"
          target="_blank"
          rel="noreferrer"
        >
          California's has 8 doctors and 7 consumers
        </a>
        ;{" "}
        <a
          href="https://www.mbc.ca.gov/about/members/"
          target="_blank"
          rel="noreferrer"
        >
          Florida's has 12 doctors and just 3 consumers
        </a>
        ). Furthermore, doctors' interest groups (like the California Medical
        Association or CMA) lobby to minimize regulations that could hold
        doctors accountable. Their influence over medical boards becomes even
        more direct when seeing that{" "}
        <a
          href="https://www.cbsnews.com/news/doctor-complaints-discipline-california-medical-board/"
          target="_blank"
          rel="noreferrer"
        >
          2 current MBC members are former CMA presidents
        </a>
        . Watch the clip below for some further insight into how concerning the
        issue is, including the fact that your complaint in California has a
        1.4% chance of getting the doctor disciplined with probation and that
        the board does not consult the complainant after submission, often just
        accepting the doctor's rebuttal.
      </p>

      <iframe
        width="100%"
        height="315"
        src="https://www.youtube.com/embed/ccliddsJYYk?si=e_z-lebUoJUSLn1U"
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>

      <p>
        In acts so egregious (often repeated multiple times) that the board does
        take action, patients often don't know they can look up these cases
        publicly. The cases are hidden across outdated government sites and the
        contents are not digitized so as to allow for even the most basic
        filtering by the offense a doctor was charged with. physician.fyi aims
        to make all these cases across all states easily searchable forever to
        empower patients to be informed.
      </p>

      <ul>
        <li>
          I'd also like to mention that{" "}
          <a
            href="https://www.citizen.org/article/report-ranking-of-the-rate-of-state-medical-boards-serious-disciplinary-actions-2019-2021/"
            target="_blank"
            rel="noreferrer"
          >
            Public Citizen has done good analysis of the rate of serious actions
            by each state medical board, finding that, for example, DC would
            have to take action almost 9 times as much as it does right now to
            match the rate at which Michigan takes action against doctors. They
            also inform that in a group of physicians who have had 5+
            malpractice payments, which accounts for the absolute worst 1% of
            all physicians, 3/4 of them have never had any medical board
            licensure action at all
          </a>
          .
        </li>
        <li>
          Please also have a look at{" "}
          <a
            href="https://www.patientsafetyaction.org/resources/"
            target="_blank"
            rel="noreferrer"
          >
            resources from the Patient Safety Action Network
          </a>
          .
        </li>
        <li>
          Also see the{" "}
          <a
            href="https://www.informedpatientinstitute.org/"
            target="_blank"
            rel="noreferrer"
          >
            Informed Patient Institute
          </a>
          .
        </li>
        <li>
          I'd like to recognize the patient advocates who have come before, such
          as the creators of 4patientsafety.org.
        </li>
      </ul>
    </article>
  );
}
