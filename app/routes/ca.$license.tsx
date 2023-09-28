import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import fs from "fs";

export const loader = async ({
  request,
  context,
  params,
}: DataFunctionArgs) => {
  const license = params.license;
  if (!license) {
    throw json(
      { error: "Unknown physician" },
      {
        status: 404,
      }
    );
  }

  const data = JSON.parse(fs.readFileSync("data/ca-grouped.json", "utf8"));

  const results = data.results[license];

  return { results };
};

export default function Route() {
  const { results } = useLoaderData<typeof loader>();

  return (
    <ul className="p-8">
      {results.map((r: any) => {
        const url = `https://www2.mbc.ca.gov/PDL/document.aspx?path=${encodeURIComponent(
          r.DIDOCS
        )}&did=${r["\xa0"]}`;
        return (
          <li key={r["\xa0"]}>
            <div>
              {r["Last Name"]}, {r["First Name"]} {r["Middle Name"]}
            </div>
            <div>{r["Type"]}</div>
            <a
              href={`https://web.archive.org/web/0/${url}`}
              target="_blank"
              rel="noreferrer"
            >
              View PDF
            </a>
          </li>
        );
      })}
    </ul>
  );
}
