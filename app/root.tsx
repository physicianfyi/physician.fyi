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
import * as Ariakit from "@ariakit/react";
import { PostHogProvider } from "posthog-js/react";
import posthog from "posthog-js";
import styles from "./tailwind.css";
import mapboxStyles from "mapbox-gl/dist/mapbox-gl.css";
import { IntentIcon } from "./components/ui/IntentIcon";
import {
  DiscordLogo,
  GithubLogo,
  Info,
  Megaphone,
  PaperPlaneTilt,
  Question,
} from "@phosphor-icons/react";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: mapboxStyles },
  { rel: "stylesheet", href: styles },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  // https://css-tricks.com/emoji-as-a-favicon/
  {
    rel: "icon",
    href: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔍</text></svg>",
  },
];

export const meta: MetaFunction = () => [{}];

// Check that PostHog is client-side (used to handle SSR)
if (typeof window !== "undefined") {
  posthog.init("phc_xmeKaxAQpUPLbVkn32p7sg1FSlOPdaekyjAthRCajW1", {
    api_host: "https://app.posthog.com",
    // Enable debug mode in development
    loaded: (posthog) => {
      if (process.env.NODE_ENV === "development") posthog.debug();
    },
    capture_pageview: false, // Manually send because it doesn't work when client side routing
  });
}

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

            <Ariakit.MenuProvider focusLoop>
              <Ariakit.MenuButton className="group flex flex-col h-12 w-12 justify-center items-center">
                <div className="menu-line group-aria-expanded:rotate-45 group-aria-expanded:translate-y-2 group-aria-expanded:opacity-50 group-focus-visible:opacity-100 opacity-50 group-hover:opacity-100 group-aria-expanded:group-hover:opacity-100" />
                <div className="menu-line group-aria-expanded:opacity-0 opacity-50 group-hover:opacity-100 group-focus-visible:opacity-100" />
                <div className="menu-line group-aria-expanded:-rotate-45 group-aria-expanded:-translate-y-2 group-aria-expanded:opacity-50 group-focus-visible:opacity-100 opacity-50 group-hover:opacity-100 group-aria-expanded:group-hover:opacity-100" />
              </Ariakit.MenuButton>
              <Ariakit.Menu gutter={8} className="popover gap-2">
                {[
                  {
                    render: <Link to="/about" />,
                    children: (
                      <>
                        <IntentIcon Icon={Info} align="middle" /> About
                      </>
                    ),
                  },
                  {
                    render: <Link to="/what-to-do" />,
                    children: (
                      <>
                        <IntentIcon Icon={Question} align="middle" /> What to do
                      </>
                    ),
                  },
                  {
                    render: <Link to="/contact" />,
                    children: (
                      <>
                        <IntentIcon Icon={PaperPlaneTilt} align="middle" />{" "}
                        Contact
                      </>
                    ),
                  },
                  null,
                  {
                    render: (
                      <a
                        href="https://chng.it/vKhKQKx9T9"
                        target="_blank"
                        rel="noreferrer"
                      />
                    ),
                    children: (
                      <>
                        <IntentIcon Icon={Megaphone} align="middle" /> Sign the
                        petition
                      </>
                    ),
                  },
                  {
                    render: (
                      <a
                        href="https://discord.gg/vKpkKcXagr"
                        target="_blank"
                        rel="noreferrer"
                      />
                    ),
                    children: (
                      <>
                        <IntentIcon Icon={DiscordLogo} align="middle" /> Join
                        the Discord
                      </>
                    ),
                  },
                  {
                    render: (
                      <a
                        href="https://github.com/physicianfyi/physician.fyi"
                        target="_blank"
                        rel="noreferrer"
                      />
                    ),
                    children: (
                      <>
                        <IntentIcon Icon={GithubLogo} align="middle" />{" "}
                        Contribute
                      </>
                    ),
                  },
                ].map((item, i) => {
                  if (!item) {
                    return (
                      <Ariakit.MenuSeparator key={i} className="separator" />
                    );
                  }
                  const { render, children } = item;
                  return (
                    <Ariakit.MenuItem
                      key={i}
                      className="text-md font-bold hover:bg-accent rounded p-2 group data-[active-item]:bg-accent scroll-m-2"
                      render={render}
                    >
                      {children}
                    </Ariakit.MenuItem>
                  );
                })}
              </Ariakit.Menu>
            </Ariakit.MenuProvider>
          </nav>

          {/* https://github.com/proofzero/rollupid/blob/f43d794625f47a99cec97836d4b4a65858ae4530/apps/console/app/root.tsx#L284 */}
          {typeof window !== "undefined" ? (
            <PostHogProvider client={posthog}>
              <Outlet />
            </PostHogProvider>
          ) : (
            <Outlet />
          )}

          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </div>

        <div className="bg-yellow-400 text-gray-900 rounded px-4 py-3 font-medium mx-4">
          <a
            href="https://chng.it/vKhKQKx9T9"
            target="_blank"
            rel="noreferrer"
            className="underline"
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
              <Link to="/" className="text-md font-medium">
                physician.fyi
              </Link>
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
                <a
                  href="https://app.posthog.com/shared/b7S6XJpQIKhs2yIzZlxPA5PRJphXgA"
                  target="_blank"
                  rel="noreferrer"
                >
                  Analytics
                </a>
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
