import * as Ariakit from "@ariakit/react";
import { IntentIcon } from "./ui/IntentIcon";
import {
  ChartLine,
  DiscordLogo,
  GithubLogo,
  Info,
  Megaphone,
  PaperPlaneTilt,
  Question,
} from "@phosphor-icons/react";
import { Link } from "@remix-run/react";

const items = [
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
        <IntentIcon Icon={PaperPlaneTilt} align="middle" /> Contact
      </>
    ),
  },
  null,
  {
    render: (
      <a href="https://chng.it/vKhKQKx9T9" target="_blank" rel="noreferrer" />
    ),
    children: (
      <>
        <IntentIcon Icon={Megaphone} align="middle" /> Sign the petition
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
        <IntentIcon Icon={DiscordLogo} align="middle" /> Join the Discord
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
        <IntentIcon Icon={GithubLogo} align="middle" /> Contribute
      </>
    ),
  },
  {
    render: (
      <a
        href="https://app.posthog.com/shared/b7S6XJpQIKhs2yIzZlxPA5PRJphXgA"
        target="_blank"
        rel="noreferrer"
      />
    ),
    children: (
      <>
        <IntentIcon Icon={ChartLine} align="middle" /> Analytics
      </>
    ),
  },
];

/**
 * Menu isn't collapsed when screen is big enough to show it all for accessibility
 */
export const Menu = () => {
  return (
    <>
      <div className="md:hidden">
        <Ariakit.MenuProvider focusLoop>
          <Ariakit.MenuButton className="group flex flex-col h-12 w-12 justify-center items-center">
            <div className="menu-line group-aria-expanded:rotate-45 group-aria-expanded:translate-y-2 group-aria-expanded:opacity-50 group-focus-visible:opacity-100 opacity-50 group-hover:opacity-100 group-aria-expanded:group-hover:opacity-100" />
            <div className="menu-line group-aria-expanded:opacity-0 opacity-50 group-hover:opacity-100 group-focus-visible:opacity-100" />
            <div className="menu-line group-aria-expanded:-rotate-45 group-aria-expanded:-translate-y-2 group-aria-expanded:opacity-50 group-focus-visible:opacity-100 opacity-50 group-hover:opacity-100 group-aria-expanded:group-hover:opacity-100" />
          </Ariakit.MenuButton>
          <Ariakit.Menu gutter={8} className="popover gap-2">
            {items.map((item, i) => {
              if (!item) {
                return <Ariakit.MenuSeparator key={i} className="" />;
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
      </div>
      <div className="hidden md:block">
        <Ariakit.CollectionProvider>
          <Ariakit.Collection className="flex justify-end flex-wrap gap-2">
            {items.map((item, i) => {
              if (!item) {
                return null;
                // return <Ariakit.Separator orientation="horizontal" key={i} />;
              }
              const { render, children } = item;
              return (
                <Ariakit.CollectionItem
                  key={i}
                  className="text-md font-bold group whitespace-nowrap"
                  render={render}
                >
                  {children}
                </Ariakit.CollectionItem>
              );
            })}
          </Ariakit.Collection>
        </Ariakit.CollectionProvider>
      </div>
    </>
  );
};
