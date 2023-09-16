import type { MetaFunction } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import fs from "fs";

export const meta: MetaFunction = () => {
  return [
    { title: "physician.fyi" },
    { name: "description", content: "Know your doctor" },
  ];
};

const groupBy = function (xs, key) {
  return xs.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

export const loader = () => {
  const data = JSON.parse(fs.readFileSync("data/ca.json", "utf8"));

  return { data };
};

export default function Index() {
  const { data } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const results = fetcher.data ? fetcher.data.results ?? [] : data.results;

  // Can group by here or in build step
  const groupedResults = groupBy(results, "License Number");
  return (
    <div className="p-8 flex flex-col gap-4">
      <div>Find physicians' disciplinary history</div>
      <fetcher.Form action="/search" method="GET">
        <div className="flex items-center gap-4">
          <input
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="John"
            name="query"
          />
          <button className="text-white text-sm bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
            Search
          </button>
        </div>
      </fetcher.Form>

      <ul>
        {Object.entries(groupedResults).map(([k, v]) => {
          return (
            <li key={k} className="flex items-center gap-2">
              <Link
                to={`/ca/${v[0]["License Type"]}%20${v[0]["License Number"]}`}
              >
                {v[0]["Last Name"]}, {v[0]["First Name"]} {v[0]["Middle Name"]}
              </Link>
              {v.length > 1 && <div>({v.length} items)</div>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
