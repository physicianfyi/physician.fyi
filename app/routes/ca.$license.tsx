import { DataFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
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
  const [licenseType, licenseNumber] = license.split(" ");

  const data = JSON.parse(fs.readFileSync("data/ca.json", "utf8"));

  const results = data.results.filter(
    (r) =>
      r["License Type"] === licenseType && r["License Number"] === licenseNumber
  );

  return { results };
};

export default function Route() {
  const { results } = useLoaderData<typeof loader>();

  return (
    <ul className="p-8">
      {results.map((r) => {
        return (
          <li key={r["\xa0"]}>
            <div>{r["Type"]}</div>
            <a href="/pdfs/AAAGL170727212446216.DID.pdf" target="_blank">
              View PDF
            </a>
          </li>
        );
      })}
    </ul>
  );
}
