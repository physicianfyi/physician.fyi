import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
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
  // https://css-tricks.com/emoji-as-a-favicon/
  {
    rel: "icon",
    href: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>👨‍⚕️</text></svg>",
  },
];

export const meta: MetaFunction = () => [{}];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="flex flex-col justify-between min-h-screen">
        <div>
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
              <Link to="/contact" className="text-md font-bold">
                Contact
              </Link>
            </div>
          </nav>

          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </div>

        <div className="bg-yellow-400 text-gray-900 rounded px-4 py-3 font-medium mx-4">
          <a
            href="https://chng.it/vKhKQKx9T9"
            target="_blank"
            rel="noreferrer"
            className="hover:font-bold focus-visible:font-bold underline"
          >
            Sign our petition
          </a>{" "}
          to make the National Practitioner Databank public. It's a federal
          repository of medical malpractice payments and adverse actions related
          to doctors. It purports to have a mission "to improve health care
          quality, protect the public, and reduce health care fraud and abuse in
          the U.S.", but it explicitly excludes the very patients who would
          benefit most from seeing findings against doctors from gaining access.
        </div>

        <footer className="bg-white rounded-lg shadow m-4 dark:bg-gray-800">
          <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
            <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
              © 2023{" "}
              <Link to="/" className="text-md font-medium">
                physician.fyi
              </Link>
              . All rights reserved.
            </span>
            <ul className="flex gap-2 flex-wrap items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
              <li>
                <Link to="/about" className="text-md font-medium">
                  About
                </Link>
              </li>
              <li>
                <Link to="/what-to-do" className="text-md font-medium">
                  What to do
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-md font-medium">
                  API Access
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-md font-medium">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </footer>
      </body>
    </html>
  );
}
