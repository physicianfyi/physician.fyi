export default function Route() {
  return (
    <article className="p-8 prose dark:prose-invert mx-auto">
      <h1>What to do if you've been harmed</h1>

      <ol>
        <li>
          Request all medical records from the doctor. This should include all
          consent forms you've signed.
        </li>
        <li>
          Consult a medical malpractice lawyer immediately. The statute of
          limitations in your state is a hard limit for filing a civil lawsuit
          to be compensated.
        </li>
        <li>
          If your case involved a medical device, submit an adverse event report
          with the FDA, which compels the manufacturer to investigate.
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
        <li>
          Sign our petition to make the National Practitioner Databank, a
          federal repository of medical malpractice payments and adverse actions
          related to doctors, public. It purports to have a mission "to improve
          health care quality, protect the public, and reduce health care fraud
          and abuse in the U.S.", but it explicitly excludes the very patients
          who would benefit most from seeing doctors' malpractices from gaining
          access.
        </li>
        {/* <li>
          If your complaint was closed without action, you are welcome to send
          it to us to publish with all personal info redacted.
        </li> */}
      </ol>
    </article>
  );
}
