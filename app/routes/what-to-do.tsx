import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";

export default function Route() {
  const posthog = usePostHog();
  useEffect(() => {
    posthog?.capture("$pageview");
  }, [posthog]);

  return (
    <article className="p-8 prose dark:prose-invert mx-auto">
      <h1>What to do if you've been harmed</h1>

      <ol>
        <li>
          Request all medical records from the doctor. This should include all
          consent forms you've signed. Try to do everything by email if possible
          for a paper trail. Email again if any records are missed. The doctor
          is allowed to charge nothing more than a small clerical fee.
        </li>
        <li>
          Consult a medical malpractice lawyer immediately. The statute of
          limitations in your state is a hard limit for filing a civil lawsuit
          to be compensated.
        </li>
        <li>
          If your case involved a medical device or drug/product, submit an{" "}
          <a
            href="https://www.accessdata.fda.gov/scripts/medwatch/index.cfm"
            target="_blank"
            rel="noreferrer"
          >
            adverse event report with the FDA
          </a>
          , which compels the manufacturer to investigate and publicly respond
          with their analysis within a month. Leave your email in that form so
          that the manufacturer can contact you for additional data—your email
          will not be made public.
        </li>
        <li>
          File a complaint with the medical board in the state you were harmed
          in. Regardless of anything you've signed or any other actions, you
          always retain the right to file a medical board complaint. Make sure
          you know the statute of limitations here too, which is separate from
          the civil suit statute of limitations.
        </li>
        <li>
          Do not sign anything from the doctor after the incident. If they force
          you to sign an NDA in exchange for recompensation, carefully consider
          if that is worth your right to speak out about it. You can try to
          amend the contract to exlude that provision, as the{" "}
          <a
            href="https://www.ftc.gov/business-guidance/resources/consumer-review-fairness-act-what-businesses-need-know"
            target="_blank"
            rel="noreferrer"
          >
            FTC Consumer Review Fairness Act
          </a>{" "}
          ensures consumers meaningful opportunity to negotiate nondisclosure
          terms. Also note that anything you signed before the
          procedure/incident cannot take away your right to post reviews about
          it based on the FTC Consumer Review Fairness Act, which says any NDA
          you sign prior to service is illegal and has the potential to
          invalidate the entire contract.
        </li>
        {/* <li>
          If your complaint was closed without action, you are welcome to send
          it to us to publish with all personal info redacted.
        </li> */}
      </ol>
    </article>
  );
}
