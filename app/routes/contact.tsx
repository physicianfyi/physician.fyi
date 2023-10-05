export default function Route() {
  return (
    <div className="mx-auto sm:p-8 flex flex-col gap-4">
      <div>Contact us for questions about API access and more</div>
      <iframe
        title="contact"
        src="https://docs.google.com/forms/d/e/1FAIpQLSerw-Lf8i8KvcOh6VbFQWQiGRwhSePr9dR-_lCZVKwgndqGqA/viewform?embedded=true"
        width="100%"
        height="1130"
        frameBorder="0"
        marginHeight={0}
        marginWidth={0}
      >
        Loading…
      </iframe>
    </div>
  );
}
