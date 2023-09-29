export default function Route() {
  return (
    <article className="p-8 prose dark:prose-invert">
      <h1>How it's made</h1>

      <h2>Preserving original documents</h2>

      <p>
        We wanted to preserve original documents for posterity in the case they
        are taken off the medical board websites (e.g., after a certain amount
        of time to conserve space), but they are tens of gigabytes per state and
        we wanted to stay as budget as possible. It turns out the Internet
        Archive Wayback Machine stores PDFs too. Therefore, we stored all PDFs
        there. The only thing is they have a rate limit that makes it take about
        5 days for 15k PDFs.
      </p>
    </article>
  );
}
