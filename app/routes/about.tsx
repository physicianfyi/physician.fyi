export default function Route() {
  return (
    <div className="p-8">
      <h1>How it's made</h1>

      <h2>Keeping original documents available</h2>

      <p>
        We wanted to preserve original documents in the case they are taken off
        the medical board websites, but they are tens of gigabytes per state and
        we wanted to stay as budget as possible. It turns out the Internet
        Archive Wayback Machine stores PDFs too. Therefore, we stored all PDFs
        there. The only thing is they have a rate limit that makes it take about
        5 days for 15k PDFs.
      </p>
    </div>
  );
}
