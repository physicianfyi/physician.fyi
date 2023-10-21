import { type DataFunctionArgs, type MetaFunction } from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import { PAGE_SIZE, STATES } from "~/services/constants";
import { selectPhysicians } from "~/services/physicians.server";
import fs from "fs";
import path from "path";
import * as Ariakit from "@ariakit/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ClockClockwise,
  IdentificationBadge,
  Info,
  MagnifyingGlass,
  Sliders,
  UserList,
  X,
} from "@phosphor-icons/react";
import { usePostHog } from "posthog-js/react";
import { Map } from "~/components/Map";
import { DateChart } from "~/components/DateChart";
import { FilterableMultiSelect } from "~/components/FilterableMultiSelect";

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

  const summarizedDatas = STATES.map((s) => {
    return JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), `data/${s}/summarize.json`),
        "utf8"
      )
    );
  });
  const summarizedData = summarizedDatas.reduce<any>((acc, curr) => {
    for (let [k, v] of Object.entries<any>(curr)) {
      if (k === "lastRun") {
        acc[k] = v;
        continue;
      }

      if (acc.hasOwnProperty(k)) {
        acc[k].numResults += v.numResults;

        for (let r of v.results) {
          if (!acc[k].results.includes(r)) {
            acc[k].results.push(r);
          }
        }

        for (let [k2, v2] of Object.entries(v.counts)) {
          if (acc[k].counts.hasOwnProperty(k2)) {
            acc[k].counts[k2] += v2;
          } else {
            acc[k].counts[k2] = v2;
          }
        }
      } else {
        acc[k] = v;
      }
    }

    return acc;
  }, {});

  const types = JSON.parse(url.searchParams.get("t") ?? "[]");
  const { results: availableTypes, counts: availableTypeCounts } =
    summarizedData.actionTypes;

  const licenseStatuses = JSON.parse(url.searchParams.get("u") ?? "[]");
  const {
    results: availableLicenseStatuses,
    counts: availableLicenseStatusCounts,
  } = summarizedData.licenseStatuses;

  const licenseTypes = JSON.parse(url.searchParams.get("l") ?? "[]");
  const { results: availableLicenseTypes, counts: availableLicenseTypeCounts } =
    summarizedData.licenseTypes;

  const schools = JSON.parse(url.searchParams.get("s") ?? "[]");
  let { results: availableSchools, counts: availableSchoolCounts } =
    summarizedData.schools;

  const specialties = JSON.parse(url.searchParams.get("a") ?? "[]");
  let { results: availableSpecialties, counts: availableSpecialtyCounts } =
    summarizedData.specialties;

  const offenses = JSON.parse(url.searchParams.get("o") ?? "[]");
  let { results: availableOffenses, counts: availableOffenseCounts } =
    summarizedData.offenses ?? { results: [], counts: {} };

  const beginning = Number(url.searchParams.get("b") ?? "0");
  const ending = Number(url.searchParams.get("e") ?? "0");

  // Don't show filtering for ones with just 1 match
  // Since we show options by count object now; this also has the benefit of not messing up indices if we include some later instead of filtering availableOffenses
  availableSchoolCounts = Object.fromEntries(
    Object.entries<any>(availableSchoolCounts).filter(([k, v]) => v > 4)
  );
  availableOffenseCounts = Object.fromEntries(
    Object.entries<any>(availableOffenseCounts).filter(([k, v]) => v > 4)
  );

  const data = await selectPhysicians({
    page,
    query,
    actionTypes: types.map((t: number) => availableTypes[t]),
    licenseStatuses: licenseStatuses.map(
      (u: number) => availableLicenseStatuses[u]
    ),
    licenseTypes: licenseTypes.map((t: number) => availableLicenseTypes[t]),
    schools: schools.map((s: number) => availableSchools[s]),
    specialties: specialties.map((a: number) => availableSpecialties[a]),
    offenses: offenses.map((o: number) => availableOffenses[o]),
    beginning,
    ending,
  });

  return {
    data,
    availableTypes,
    availableTypeCounts,
    availableLicenseStatuses,
    availableLicenseStatusCounts,
    availableLicenseTypes,
    availableLicenseTypeCounts,
    availableSchools,
    availableSchoolCounts,
    availableSpecialties,
    availableSpecialtyCounts,
    availableOffenses,
    availableOffenseCounts,
  };
};

export default function Index() {
  const posthog = usePostHog();
  useEffect(() => {
    posthog?.capture("$pageview");
  }, [posthog]);

  const [params] = useSearchParams();
  const page = Number(params.get("p") ?? 0);
  const query = params.get("q") ?? "";
  // TODO Figure out why plain object makes condition in effect run infinitely
  let types: number[] = useMemo(
    () => JSON.parse(params.get("t") ?? "[]"),
    [params]
  );
  let licenseStatuses: number[] = useMemo(
    () => JSON.parse(params.get("u") ?? "[]"),
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
  let specialties: number[] = useMemo(
    () => JSON.parse(params.get("a") ?? "[]"),
    [params]
  );
  let offenses: number[] = useMemo(
    () => JSON.parse(params.get("o") ?? "[]"),
    [params]
  );
  let beginningParam: number = useMemo(
    () => Number(params.get("b") ?? "0"),
    [params]
  );
  let endingParam: number = useMemo(
    () => Number(params.get("e") ?? "0"),
    [params]
  );
  const [beginning, setBeginning] = useState<number>(0);
  const [ending, setEnding] = useState<number>(0);
  useEffect(() => {
    if (beginningParam) {
      setBeginning(beginningParam);
    }
  }, [beginningParam]);
  useEffect(() => {
    if (endingParam) {
      setEnding(endingParam);
    }
  }, [endingParam]);

  const {
    data,
    availableTypes,
    availableTypeCounts,
    availableLicenseStatuses,
    availableLicenseStatusCounts,
    availableLicenseTypes,
    availableLicenseTypeCounts,
    availableSchools,
    availableSchoolCounts,
    availableSpecialties,
    availableSpecialtyCounts,
    availableOffenses,
    availableOffenseCounts,
  } = useLoaderData<typeof loader>();
  const results = data.results;

  const [typeValues, setTypeValues] = useState(types);
  const [licenseStatusValues, setLicenseStatusValues] =
    useState(licenseStatuses);
  const [licenseTypeValues, setLicenseTypeValues] = useState(licenseTypes);
  const [schoolValues, setSchoolValues] = useState(schools);
  const [specialtyValues, setSpecialtyValues] = useState(specialties);
  const [offenseValues, setOffenseValues] = useState(offenses);

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
      licenseStatuses.length !== licenseStatusValues.length ||
      licenseStatuses.some(
        // @ts-ignore ariakit TS issue
        (value, index) => value !== licenseStatusValues[index]
      )
    ) {
      submit(filterRef.current, {
        // TODO For some reason not working here or as Form prop
        preventScrollReset: true,
      });
    }
  }, [submit, licenseStatusValues, licenseStatuses]);
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
      specialties.length !== specialtyValues.length ||
      // @ts-ignore ariakit TS issue
      specialties.some((value, index) => value !== specialtyValues[index])
    ) {
      submit(filterRef.current, {
        // TODO For some reason not working here or as Form prop
        preventScrollReset: true,
      });
    }
  }, [submit, specialtyValues, specialties]);
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
  useEffect(() => {
    // Submit even if 0 since resetting
    submit(filterRef.current, {
      preventScrollReset: true,
    });
  }, [beginning, submit]);
  useEffect(() => {
    submit(filterRef.current, {
      preventScrollReset: true,
    });
  }, [ending, submit]);

  const queryRef = useRef<HTMLFormElement>(null);

  return (
    <div className="p-4 sm:p-8 md:p-16 flex flex-col gap-4">
      <div className="">Find your doctor's history</div>

      <div
        className="p-4 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300"
        role="alert"
      >
        Just California and Florida for now—more states coming soon
        <div>
          If you'd like to help,{" "}
          <a
            href="https://discord.gg/vKpkKcXagr"
            target="_blank"
            rel="noreferrer"
          >
            join the Discord
          </a>{" "}
          and/or{" "}
          <a
            href="https://github.com/physicianfyi/physician.fyi"
            target="_blank"
            rel="noreferrer"
          >
            check out the repository
          </a>
          .
        </div>
      </div>

      <h2 id="filters">
        <Sliders className="inline-icon" weight="bold" /> Filters
        <Ariakit.TooltipProvider showTimeout={0}>
          <Ariakit.TooltipAnchor
            className=""
            render={
              <Info weight="duotone" className="inline align-super text-lg" />
            }
          ></Ariakit.TooltipAnchor>
          <Ariakit.Tooltip className="text-xs font-semibold popover">
            Adding options within a filter "or"s them; adding options between
            filters "and"s them
          </Ariakit.Tooltip>
        </Ariakit.TooltipProvider>
      </h2>

      <Form
        method="GET"
        className="grid grid-cols-12 gap-4 [&>*]:col-span-12 [&>*]:md:col-span-6 [&>*]:xl:col-span-4"
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
          name="u"
          value={JSON.stringify(licenseStatusValues)}
          readOnly
          hidden
        />
        <input
          name="l"
          value={JSON.stringify(licenseTypeValues)}
          readOnly
          hidden
        />
        <input name="s" value={JSON.stringify(schoolValues)} readOnly hidden />
        <input
          name="a"
          value={JSON.stringify(specialtyValues)}
          readOnly
          hidden
        />
        <input name="o" value={JSON.stringify(offenseValues)} readOnly hidden />
        <input name="b" value={beginning} hidden readOnly />
        <input name="e" value={ending} hidden readOnly />

        <FilterableMultiSelect
          label="Type of action"
          values={typeValues}
          setValues={setTypeValues}
          items={availableTypes}
          counts={availableTypeCounts}
        />

        <FilterableMultiSelect
          label="License status"
          values={licenseStatusValues}
          setValues={setLicenseStatusValues}
          items={availableLicenseStatuses}
          counts={availableLicenseStatusCounts}
        />

        <FilterableMultiSelect
          label="License type"
          values={licenseTypeValues}
          setValues={setLicenseTypeValues}
          items={availableLicenseTypes}
          counts={availableLicenseTypeCounts}
          nullFallback="Unlicensed"
        />

        <FilterableMultiSelect
          label="School"
          values={schoolValues}
          setValues={setSchoolValues}
          items={availableSchools}
          counts={availableSchoolCounts}
        />

        <FilterableMultiSelect
          label="Specialty"
          values={specialtyValues}
          setValues={setSpecialtyValues}
          items={availableSpecialties}
          counts={availableSpecialtyCounts}
        />

        <FilterableMultiSelect
          label={
            <>
              Offense{" "}
              <span className="bg-indigo-400 text-white px-1.5 py-0.5 rounded text-xs font-semibold shadow-inner border border-indigo-500">
                beta
              </span>
            </>
          }
          values={offenseValues}
          setValues={setOffenseValues}
          items={availableOffenses}
          counts={availableOffenseCounts}
        />
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
              placeholder="e.g., 'Smith, John' or 'G 12345'"
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
              name="u"
              value={JSON.stringify(licenseStatusValues)}
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
                  <X size={32} className="w-4 h-4" weight="bold" />
                </Link>
              )}

              <button
                type="submit"
                className="p-2.5 h-full text-sm font-medium text-white focus:z-10 bg-blue-700 rounded-r-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                <MagnifyingGlass className="w-4 h-4" weight="duotone" />
              </button>
            </div>
          </div>
        </div>
      </Form>

      <div className="text-card-foreground rounded-lg bg-card p-4">
        <div className="flex items-center flex-wrap justify-between gap-2 text-sm">
          <div role="alert">
            <span className="font-medium">
              {data.numResults} physicians with{" "}
              {data.chartData.reduce(
                (acc, curr) => acc + (curr.actions ?? 0),
                0
              )}{" "}
              actions
            </span>{" "}
            found
          </div>

          <div className="text-xs">
            Last updated {data.lastUpdated.split("T")[0]}
          </div>
        </div>

        <DateChart
          data={data.chartData}
          setBeginning={setBeginning}
          setEnding={setEnding}
        />

        <div className="w-full overflow-hidden flex flex-col gap-1">
          <span className="w-fit bg-indigo-400 text-white px-1.5 py-0.5 rounded text-xs font-semibold shadow-inner border border-indigo-500">
            beta
          </span>
          <Map data={data.geo} />
        </div>
      </div>

      <h2 id="results">
        <UserList className="inline-icon" weight="bold" /> Licenses
      </h2>

      <ul className="flex flex-col gap-2">
        {results.map(({ license, data, state }) => {
          return (
            <li key={license}>
              <Link to={`/${state}/${license}`} className="group">
                <div className="group-hover:bg-card group-focus-visible:bg-card p-4 rounded flex flex-col gap-4">
                  <div className="px-1 group-hover:font-medium group-focus-visible:font-medium">
                    <div>
                      <span className="uppercase">{data.name}</span>{" "}
                      {(data.actions?.length ?? 0) > 1 &&
                        `(${data.actions.length} actions)`}
                    </div>
                    {data.specialties && (
                      <div className="text-sm">
                        {data.specialties.join(", ")}
                      </div>
                    )}
                  </div>
                  <div className="flex items-start sm:items-end gap-1 sm:gap-0 justify-between flex-col sm:flex-row">
                    <div className="px-1 font-medium flex items-center gap-1 text-xs text-gray-600 uppercase">
                      {state}
                      <Ariakit.TooltipProvider showTimeout={0}>
                        <Ariakit.TooltipAnchor
                          className=""
                          render={
                            <IdentificationBadge
                              className={`w-4 h-4 ${
                                data.licenseStatus ===
                                "license renewed & current"
                                  ? "text-green-500"
                                  : "text-red-500"
                              }`}
                              weight="bold"
                            />
                          }
                        ></Ariakit.TooltipAnchor>
                        <Ariakit.Tooltip className="uppercase text-xs font-semibold popover">
                          {data.licenseStatus}
                        </Ariakit.Tooltip>
                      </Ariakit.TooltipProvider>
                      {license.startsWith("UNLICENSED-") ? "N/A" : license}
                    </div>
                    {data.actions && (
                      <div className="uppercase flex items-center gap-1 bg-gray-100 text-gray-800 text-xs font-medium mr-2 px-1 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">
                        <ClockClockwise className="w-4 h-4" weight="bold" />
                        {data.actions.at(0).date}{" "}
                        {data.actions.length > 1 &&
                          data.actions.at(-1).date !==
                            data.actions.at(0).date &&
                          `- ${data.actions.at(-1).date}`}
                      </div>
                    )}
                  </div>
                </div>
              </Link>

              <hr className="h-px mt-2 bg-gray-200 border-0 dark:bg-gray-700" />
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
            name="u"
            value={JSON.stringify(licenseStatusValues)}
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
            name="s"
            value={JSON.stringify(schoolValues)}
            readOnly
            hidden
          />
          <input
            name="a"
            value={JSON.stringify(specialtyValues)}
            readOnly
            hidden
          />
          <input
            name="o"
            value={JSON.stringify(offenseValues)}
            readOnly
            hidden
          />
          <input name="b" value={beginning} hidden readOnly />
          <input name="e" value={ending} hidden readOnly />
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
