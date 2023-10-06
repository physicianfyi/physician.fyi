import { type DataFunctionArgs, type MetaFunction } from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import { PAGE_SIZE } from "~/services/constants";
import { selectPhysicians } from "~/services/physicians.server";
import fs from "fs";
import * as Ariakit from "@ariakit/react";
import { useEffect, useId, useMemo, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export const meta: MetaFunction = () => {
  return [
    { title: "physician.fyi" },
    { name: "description", content: "Know your doctor" },
  ];
};

export const loader = async ({ request, params }: DataFunctionArgs) => {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("p") ?? 0);
  const query = url.searchParams.get("q") ?? "";

  const summarizedData = JSON.parse(
    fs.readFileSync("data/ca/summarize.json", "utf8")
  );

  const types = JSON.parse(url.searchParams.get("t") ?? "[]");
  const { results: availableTypes, counts: availableTypeCounts } =
    summarizedData.actionTypes;

  const licenseTypes = JSON.parse(url.searchParams.get("l") ?? "[]");
  const { results: availableLicenseTypes, counts: availableLicenseTypeCounts } =
    summarizedData.licenseTypes;

  const schools = JSON.parse(url.searchParams.get("s") ?? "[]");
  let { results: availableSchools, counts: availableSchoolCounts } =
    summarizedData.schools;

  const offenses = JSON.parse(url.searchParams.get("o") ?? "[]");
  let { results: availableOffenses, counts: availableOffenseCounts } =
    summarizedData.offenses ?? { results: [], counts: {} };

  // Don't show filtering for ones with just 1 match
  // availableOffenses = availableOffenses.filter((o: string) => {
  //   return availableOffenseCounts[o] >= 5;
  // });
  // Since we show options by count object now; this also has the benefit of not messing up indices if we include some later
  availableSchoolCounts = Object.fromEntries(
    Object.entries<any>(availableSchoolCounts).filter(([k, v]) => v > 2)
  );

  const data = await selectPhysicians({
    page,
    query,
    actionTypes: types.map((t: number) => availableTypes[t]),
    licenseTypes: licenseTypes.map((t: number) => availableLicenseTypes[t]),
    schools: schools.map((s: number) => availableSchools[s]),
    offenses: offenses.map((o: number) => availableOffenses[o]),
  });

  return {
    data,
    availableTypes,
    availableTypeCounts,
    availableLicenseTypes,
    availableLicenseTypeCounts,
    availableSchools,
    availableSchoolCounts,
    availableOffenses,
    availableOffenseCounts,
  };
};

export default function Index() {
  const [params] = useSearchParams();
  const page = Number(params.get("p") ?? 0);
  const query = params.get("q") ?? "";
  // TODO Figure out why plain object makes condition in effect run infinitely
  let types: number[] = useMemo(
    () => JSON.parse(params.get("t") ?? "[]"),
    [params]
  );
  let licenseTypes: number[] = useMemo(
    () => JSON.parse(params.get("l") ?? "[]"),
    [params]
  );
  let schools: number[] = useMemo(
    () => JSON.parse(params.get("s") ?? "[]"),
    [params]
  );
  let offenses: number[] = useMemo(
    () => JSON.parse(params.get("o") ?? "[]"),
    [params]
  );

  const {
    data,
    availableTypes,
    availableTypeCounts,
    availableLicenseTypes,
    availableLicenseTypeCounts,
    availableSchools,
    availableSchoolCounts,
    availableOffenses,
    availableOffenseCounts,
  } = useLoaderData<typeof loader>();
  const results = data.results;

  const select = Ariakit.useSelectStore({
    // @ts-ignore ariakit TS issue
    defaultValue: types,
    focusLoop: true,
  });
  const typeValues = select.useState("value");
  const mounted = select.useState("mounted");

  const licenseTypeSelect = Ariakit.useSelectStore({
    // @ts-ignore ariakit TS issue
    defaultValue: licenseTypes,
    focusLoop: true,
  });
  const licenseTypeValues = licenseTypeSelect.useState("value");
  const licenseTypeMounted = licenseTypeSelect.useState("mounted");

  const schoolSelect = Ariakit.useSelectStore({
    // @ts-ignore ariakit TS issue
    defaultValue: schools,
    focusLoop: true,
  });
  const schoolValues = schoolSelect.useState("value");
  const schoolMounted = schoolSelect.useState("mounted");

  const offenseSelect = Ariakit.useSelectStore({
    // @ts-ignore ariakit TS issue
    defaultValue: offenses,
    focusLoop: true,
  });
  const offenseValues = offenseSelect.useState("value");
  const offenseMounted = offenseSelect.useState("mounted");

  const submit = useSubmit();
  const filterRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (
      types.length !== typeValues.length ||
      // @ts-ignore ariakit TS issue
      types.some((value, index) => value !== typeValues[index])
    ) {
      submit(filterRef.current, {
        // TODO For some reason not working here or as Form prop
        preventScrollReset: true,
      });
    }
  }, [submit, typeValues, types]);
  useEffect(() => {
    if (
      licenseTypes.length !== licenseTypeValues.length ||
      // @ts-ignore ariakit TS issue
      licenseTypes.some((value, index) => value !== licenseTypeValues[index])
    ) {
      submit(filterRef.current, {
        // TODO For some reason not working here or as Form prop
        preventScrollReset: true,
      });
    }
  }, [submit, licenseTypeValues, licenseTypes]);
  useEffect(() => {
    if (
      schools.length !== schoolValues.length ||
      // @ts-ignore ariakit TS issue
      schools.some((value, index) => value !== schoolValues[index])
    ) {
      submit(filterRef.current, {
        // TODO For some reason not working here or as Form prop
        preventScrollReset: true,
      });
    }
  }, [submit, schoolValues, schools]);
  useEffect(() => {
    if (
      offenses.length !== offenseValues.length ||
      // @ts-ignore ariakit TS issue
      offenses.some((value, index) => value !== offenseValues[index])
    ) {
      submit(filterRef.current, {
        preventScrollReset: true,
      });
    }
  }, [submit, offenseValues, offenses]);

  const queryRef = useRef<HTMLFormElement>(null);
  const id = useId();

  return (
    <div className="p-4 sm:p-8 md:p-16 flex flex-col gap-4">
      <div className="">Find your doctor's history</div>

      <div
        className="p-4 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300"
        role="alert"
      >
        Just California for now—more states coming soon
      </div>

      <Form
        method="GET"
        className="flex flex-col gap-4"
        ref={filterRef}
        // TODO not working here or as submit prop
        preventScrollReset
      >
        <input name="q" value={query} hidden readOnly />
        <input
          name="t"
          // TODO Figure out if can natively submit string[]
          value={JSON.stringify(typeValues)}
          readOnly
          // https://github.com/facebook/react/issues/13424
          // onChange={(event) => {
          //   console.log(event);
          // }}
          hidden
        />
        <input
          name="l"
          value={JSON.stringify(licenseTypeValues)}
          readOnly
          hidden
        />
        <input name="s" value={JSON.stringify(schoolValues)} readOnly hidden />
        <input name="o" value={JSON.stringify(offenseValues)} readOnly hidden />

        <div className="flex flex-col gap-1">
          <div className="flex items-end justify-between">
            <Ariakit.SelectLabel className="text-sm font-medium" store={select}>
              Type of action
            </Ariakit.SelectLabel>
            {typeValues.length > 0 && (
              <button
                type="button"
                className="text-xs hover:underline"
                onClick={() => {
                  select.setValue([]);
                }}
              >
                Clear
              </button>
            )}
          </div>
          <Ariakit.Select
            store={select}
            className="flex justify-between items-center py-2.5 px-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
          >
            <div className="flex items-center gap-2 flex-wrap">
              {/* @ts-ignore */}
              {typeValues.map((v) => (
                <div
                  key={v}
                  className="flex items-center gap-1 bg-blue-100 whitespace-nowrap text-blue-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
                >
                  <div>{availableTypes[v]}</div>
                  <div className="bg-white rounded-full px-1">
                    {availableTypeCounts[availableTypes[v]]}
                  </div>
                </div>
              ))}
            </div>
            <Ariakit.SelectArrow />
          </Ariakit.Select>
          {mounted && (
            <Ariakit.SelectPopover
              store={select}
              gutter={4}
              sameWidth
              className="select-popover"
            >
              {Object.keys(availableTypeCounts).map((key: string) => (
                <Ariakit.SelectItem
                  key={`action-${key}`}
                  // @ts-ignore TODO File ticket with ariakit to allow number
                  value={availableTypes.indexOf(key)}
                  className="select-item"
                >
                  <Ariakit.SelectItemCheck />
                  <div className="[&>*]:align-middle">
                    <span>{key} </span>
                    <span className="bg-white rounded-full px-1 text-black text-xs">
                      {availableTypeCounts[key]}
                    </span>
                  </div>
                </Ariakit.SelectItem>
              ))}
            </Ariakit.SelectPopover>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-end justify-between">
            <Ariakit.SelectLabel
              className="text-sm font-medium"
              store={licenseTypeSelect}
            >
              Type of license
            </Ariakit.SelectLabel>
            {licenseTypeValues.length > 0 && (
              <button
                type="button"
                className="text-xs hover:underline"
                onClick={() => {
                  licenseTypeSelect.setValue([]);
                }}
              >
                Clear
              </button>
            )}
          </div>
          <Ariakit.Select
            store={licenseTypeSelect}
            className="flex justify-between items-center py-2.5 px-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
          >
            <div className="flex items-center gap-2 flex-wrap">
              {/* @ts-ignore */}
              {licenseTypeValues.map((v) => (
                <div
                  key={v}
                  className="flex items-center gap-1 bg-blue-100 whitespace-nowrap text-blue-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
                >
                  <div>{availableLicenseTypes[v] ?? "Unlicensed"}</div>
                  <div className="bg-white rounded-full px-1">
                    {availableLicenseTypeCounts[availableLicenseTypes[v]]}
                  </div>
                </div>
              ))}
            </div>
            <Ariakit.SelectArrow />
          </Ariakit.Select>
          {licenseTypeMounted && (
            <Ariakit.SelectPopover
              store={licenseTypeSelect}
              gutter={4}
              sameWidth
              className="select-popover"
            >
              {Object.keys(availableLicenseTypeCounts).map((key: string) => (
                <Ariakit.SelectItem
                  key={`license-${key}`}
                  // @ts-ignore TODO File ticket with ariakit to allow number
                  value={availableLicenseTypes.indexOf(key)}
                  className="select-item"
                >
                  <Ariakit.SelectItemCheck />
                  <div className="[&>*]:align-middle">
                    <span>{key ?? "Unlicensed"} </span>
                    <span className="bg-white rounded-full px-1 text-black text-xs">
                      {availableLicenseTypeCounts[key]}
                    </span>
                  </div>
                </Ariakit.SelectItem>
              ))}
            </Ariakit.SelectPopover>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-end justify-between">
            <Ariakit.SelectLabel
              className="text-sm font-medium"
              store={schoolSelect}
            >
              School
            </Ariakit.SelectLabel>
            {schoolValues.length > 0 && (
              <button
                type="button"
                className="text-xs hover:underline"
                onClick={() => {
                  schoolSelect.setValue([]);
                }}
              >
                Clear
              </button>
            )}
          </div>
          <Ariakit.Select
            store={schoolSelect}
            className="flex justify-between items-center py-2.5 px-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
          >
            <div className="flex items-center gap-2 flex-wrap">
              {/* @ts-ignore */}
              {schoolValues.map((v) => (
                <div
                  key={v}
                  className="flex items-center gap-1 bg-blue-100 whitespace-nowrap text-blue-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
                >
                  <div>{availableSchools[v]}</div>
                  <div className="bg-white rounded-full px-1">
                    {availableSchoolCounts[availableSchools[v]]}
                  </div>
                </div>
              ))}
            </div>
            <Ariakit.SelectArrow />
          </Ariakit.Select>
          {schoolMounted && (
            <Ariakit.SelectPopover
              store={schoolSelect}
              gutter={4}
              sameWidth
              className="select-popover"
            >
              {Object.keys(availableSchoolCounts).map((key: string) => (
                <Ariakit.SelectItem
                  key={`school-${key}`}
                  // @ts-ignore TODO File ticket with ariakit to allow number
                  value={availableSchools.indexOf(key)}
                  className="select-item"
                >
                  <Ariakit.SelectItemCheck />
                  <div className="[&>*]:align-middle">
                    <span>{key === "null" ? "N/A" : key} </span>
                    <span className="bg-white rounded-full px-1 text-black text-xs">
                      {availableSchoolCounts[key]}
                    </span>
                  </div>
                </Ariakit.SelectItem>
              ))}
            </Ariakit.SelectPopover>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-end justify-between">
            <Ariakit.SelectLabel
              className="text-sm font-medium"
              store={offenseSelect}
            >
              Offense
            </Ariakit.SelectLabel>
            {offenseValues.length > 0 && (
              <button
                type="button"
                className="text-xs hover:underline"
                onClick={() => {
                  offenseSelect.setValue([]);
                }}
              >
                Clear
              </button>
            )}
          </div>
          <Ariakit.Select
            store={offenseSelect}
            className="flex justify-between items-center py-2.5 px-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
          >
            <div className="flex items-center gap-2 flex-wrap">
              {/* @ts-ignore */}
              {offenseValues.map((v) => (
                <div
                  key={v}
                  className="flex items-center gap-1 bg-blue-100 whitespace-nowrap text-blue-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
                >
                  <div>{availableOffenses[v]}</div>
                  <div className="bg-white rounded-full px-1">
                    {availableOffenseCounts[availableOffenses[v]]}
                  </div>
                </div>
              ))}
            </div>
            <Ariakit.SelectArrow />
          </Ariakit.Select>
          {offenseMounted && (
            <Ariakit.SelectPopover
              store={offenseSelect}
              gutter={4}
              sameWidth
              className="select-popover"
            >
              {availableOffenses.map((value: string, index: number) => (
                <Ariakit.SelectItem
                  key={`license-${value}`}
                  // @ts-ignore TODO File ticket with ariakit to allow number
                  value={index}
                  className="select-item"
                >
                  <Ariakit.SelectItemCheck />
                  <div className="[&>*]:align-middle">
                    <span>{value} </span>
                    <span className="bg-white rounded-full px-1 text-black text-xs">
                      {availableOffenseCounts[value]}
                    </span>
                  </div>
                </Ariakit.SelectItem>
              ))}
            </Ariakit.SelectPopover>
          )}
        </div>
      </Form>

      <Form method="GET" ref={queryRef} preventScrollReset>
        {/* When changing query, want to go back to page 0 so don't include page field */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="query">
            Name or license number
          </label>
          <div className="relative w-full">
            <input
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="e.g., John or G-12345"
              name="q"
              // TODO defaultValue doesn't get reset when clearing query, expected but weird
              defaultValue={query}
              // Can't detect clicking native clear
              // type="search"
              id="query"
              autoComplete="off"
            />
            <input
              name="t"
              value={JSON.stringify(typeValues)}
              readOnly
              hidden
            />
            <input
              name="l"
              value={JSON.stringify(licenseTypeValues)}
              readOnly
              hidden
            />
            <input
              name="o"
              value={JSON.stringify(offenseValues)}
              readOnly
              hidden
            />

            <div
              className="inline-flex absolute top-0 right-0 rounded-md shadow-sm h-full"
              role="group"
            >
              {query && (
                <Link
                  // type="reset"
                  to="/"
                  prefetch="intent"
                  onClick={(event) => {
                    queryRef.current?.reset();
                  }}
                  preventScrollReset
                  // grid place-items-center to center svg like button did
                  className="grid place-items-center p-2.5 h-full text-sm font-medium text-white bg-gray-400 rounded-l-lg border border-gray-400 hover:bg-gray-800 focus:ring-4 focus:z-10 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z"
                    ></path>
                  </svg>
                </Link>
              )}

              <button
                type="submit"
                className="p-2.5 h-full text-sm font-medium text-white focus:z-10 bg-blue-700 rounded-r-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                <svg
                  className="w-4 h-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </Form>

      <div
        className="flex items-center flex-wrap justify-between gap-2 p-4 text-sm text-card-foreground rounded-lg bg-card"
        role="alert"
      >
        <div>
          <span className="font-medium">
            {data.numResults} physicians with{" "}
            {data.chartData.reduce(
              (acc, curr) => acc + (curr.v.actions ?? 0),
              0
            )}{" "}
            actions
          </span>{" "}
          found
        </div>
        <div className="text-xs">
          Last updated {data.lastUpdated.split("T")[0]}
        </div>

        {/* TODO Filter by date range here https://recharts.org/en-US/examples/HighlightAndZoomLineChart */}
        <ResponsiveContainer width="100%" height={300}>
          <LineChart id={id} data={data.chartData}>
            <Line
              type="natural"
              dataKey="v.actions"
              stroke="#8884d8"
              name="Actions"
            />
            <Line
              type="natural"
              dataKey="v.physicians"
              stroke="#82ca9d"
              animationDuration={300}
              name="Physicians"
            />
            <XAxis dataKey="k" />
            <YAxis />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h2 id="results">Results</h2>

      <ul className="flex flex-col gap-2">
        {results.map(({ license, data }) => {
          return (
            <li key={license}>
              <Link to={`/ca/${license}`} className="group">
                <div className="group-hover:bg-card group-focus-visible:bg-card py-1 rounded">
                  <div className="px-1 flex items-center gap-2 group-hover:font-medium group-focus-visible:font-medium">
                    <div>
                      {data.name}{" "}
                      {(data.actions?.length ?? 0) > 1 &&
                        `(${data.actions.length} actions)`}
                    </div>
                  </div>
                  <div className="flex items-start sm:items-end gap-1 sm:gap-0 justify-between flex-col sm:flex-row">
                    <div className="px-1 font-medium flex items-center gap-1 text-xs text-gray-600">
                      <svg
                        className="w-4 h-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 256 256"
                      >
                        <circle
                          cx="128"
                          cy="136"
                          r="32"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="24"
                        />
                        <rect
                          x="32"
                          y="48"
                          width="192"
                          height="160"
                          rx="8"
                          transform="translate(256) rotate(90)"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="24"
                        />
                        <line
                          x1="96"
                          y1="68"
                          x2="160"
                          y2="68"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="24"
                        />
                        <path
                          d="M84,187.21a60,60,0,0,1,88,0"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="24"
                        />
                      </svg>
                      {license.startsWith("UNLICENSED-") ? "N/A" : license}
                    </div>
                    {data.actions && (
                      <div className="flex items-center gap-1 bg-gray-100 text-gray-800 text-xs font-medium mr-2 px-1 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">
                        <svg
                          className="w-4 h-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 256 256"
                        >
                          <polyline
                            points="128 80 128 128 168 152"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="24"
                          />
                          <polyline
                            points="184 104 224 104 224 64"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="24"
                          />
                          <path
                            d="M188.4,192a88,88,0,1,1,1.83-126.23C202,77.69,211.72,88.93,224,104"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="24"
                          />
                        </svg>
                        {data.actions.at(0).date}{" "}
                        {data.actions.length > 1 &&
                          `- ${data.actions.at(-1).date}`}
                      </div>
                    )}
                  </div>
                </div>
              </Link>

              <hr className="h-px mt-2 bg-gray-200 border-0 dark:bg-gray-700"></hr>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col items-center">
        <span className="text-sm text-gray-700 dark:text-gray-400">
          Showing{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {page * PAGE_SIZE + 1}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {Math.min(page * PAGE_SIZE + PAGE_SIZE, data.numResults)}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {data.numResults}
          </span>{" "}
          physicians
        </span>

        {/* TODO Add hash to route to scroll to #results not top of window */}
        {/* Pagination needs to be separate or else page change field will be submitted */}
        <Form
          method="GET"
          action="/#results"
          className="inline-flex mt-2 xs:mt-0"
        >
          {/* Want to maintain query when paginating */}
          <input name="q" value={query} hidden readOnly />
          <input name="t" value={JSON.stringify(typeValues)} readOnly hidden />
          <input
            name="l"
            value={JSON.stringify(licenseTypeValues)}
            readOnly
            hidden
          />
          <input
            name="s"
            value={JSON.stringify(schoolValues)}
            readOnly
            hidden
          />
          <input
            name="o"
            value={JSON.stringify(offenseValues)}
            readOnly
            hidden
          />
          <button
            name="p"
            value={page - 1}
            disabled={page <= 0}
            className="flex items-center justify-center px-4 h-10 text-base font-medium text-white bg-gray-800 rounded-l hover:enabled:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            Prev
          </button>
          <button
            name="p"
            value={page + 1}
            disabled={page >= Math.floor(data.numResults / PAGE_SIZE)}
            className="flex items-center justify-center px-4 h-10 text-base font-medium text-white bg-gray-800 border-0 border-l border-gray-700 rounded-r hover:enabled:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            Next
          </button>
        </Form>
      </div>
    </div>
  );
}
