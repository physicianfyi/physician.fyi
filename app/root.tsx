import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import styles from "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <nav className="flex items-center justify-between p-4">
          <Link to="/" className="text-lg font-bold font-serif">
            👨‍⚕️ physician.fyi 🔍
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/about" className="text-md font-bold">
              About
            </Link>
            <Link to="/what-to-do" className="text-md font-bold">
              What to do
            </Link>
          </div>
        </nav>

        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
