import { DataFunctionArgs, json } from "@remix-run/node";
import fs from "fs";
import Fuse from "fuse.js";

export async function loader({ request }: DataFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("query");
  if (typeof query !== "string") {
    return json(
      {
        error: "Correctly format query",
      },
      { status: 422 }
    );
  }

  if (!query.length) {
    return null;
  }

  const data = JSON.parse(fs.readFileSync("data/ca.json", "utf8"));

  const options = {
    includeScore: false,
    keys: [
      "First Name",
      "Middle Name",
      "Last Name",
      "License Number",
      {
        name: "fullLicense",
        getFn: (r) => `${r["License Type"]} ${r["License Number"]}`,
      },
    ],
  };

  const fuse = new Fuse(data.results, options);

  const results = fuse.search(query);

  return { results: results.map((r) => r.item) };
}
