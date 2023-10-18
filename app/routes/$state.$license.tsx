import {
  ChartPie,
  ClockClockwise,
  Gavel,
  GraduationCap,
  IdentificationBadge,
  MapPin,
  User,
} from "@phosphor-icons/react";
import type { DataFunctionArgs, LinksFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { DiscussionEmbed } from "disqus-react";
import fs from "fs";
import { ResponsiveContainer, PieChart, Pie, Cell, LabelList } from "recharts";
import path from "path";
import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";
import { STATES } from "~/services/constants";

export const links: LinksFunction = () => [
  {
    rel: "icon",
    href: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>👨‍⚕️</text></svg>",
  },
];

export const loader = async ({
  request,
  context,
  params,
}: DataFunctionArgs) => {
  const state = params.state;
  if (!state || !STATES.includes(state)) {
    throw json(
      { error: "Unknown physician" },
      {
        status: 404,
      }
    );
  }
  const license = params.license;
  if (!license) {
    throw json(
      { error: "Unknown physician" },
      {
        status: 404,
      }
    );
  }

  const data = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), `data/${state}/clean.json`),
      "utf8"
    )
  );
  const profile = data.profiles[license];

  let read;
  try {
    read = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), `data/${state}/read.json`),
        "utf8"
      )
    ).results;
  } catch {}

  for (let action of profile.actions ?? []) {
    const url = action.url;
    if (!url || state !== "ca") continue;

    const parsedUrl = new URL(url);
    const did = parsedUrl.searchParams.get("did");
    const path = `${did}.pdf.txt`;

    if (read[path]) {
      action.offenses = read[path];
    }
  }

  return { profile, license, state, baseUrl: data.baseUrl };
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function Route() {
  const posthog = usePostHog();
  useEffect(() => {
    posthog?.capture("$pageview");
  }, [posthog]);

  // const params = useParams()
  const { profile, license, state, baseUrl } = useLoaderData<typeof loader>();

  const pieData = Object.entries(profile.minActivities ?? {}).reduce<any>(
    (acc, [k, v]) => {
      if (v) acc.push({ name: k, value: v });
      return acc;
    },
    []
  );

  return (
    <div className="p-8 flex flex-col gap-4 max-w-6xl mx-auto">
      {/* Just so the disqus thing changing height doesn't show on load */}
      <div className="min-h-screen flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <h1 className="uppercase">
              <User weight="bold" className="inline-icon" /> {profile.name}
            </h1>
            <a
              href={`${baseUrl}${profile.licenseUrl}`}
              target="_blank"
              rel="noreferrer"
            >
              View license
            </a>
          </div>

          <h4>
            <IdentificationBadge
              className={`inline mr-1 ${
                profile.licenseStatus === "license renewed & current"
                  ? "text-green-500"
                  : "text-red-500"
              }`}
              weight="bold"
            />
            <span className="uppercase">{state}</span> License{" "}
            <span className="uppercase">{license}</span>
          </h4>

          {profile.survey?.["PRIMARY AREA OF PRACTICE"] && (
            <h4>
              {profile.survey["PRIMARY AREA OF PRACTICE"]}
              {profile.survey?.["SECONDARY AREA OF PRACTICE"]?.length > 0 &&
                ", "}
              {profile.survey?.["SECONDARY AREA OF PRACTICE"]?.join(", ")}
            </h4>
          )}

          <div className="flex gap-2">
            <h2>
              <MapPin weight="duotone" className="" />
            </h2>
            <div className="uppercase">
              <div>{profile.address}</div>
              <div>{profile.address2}</div>
              <div>{profile.address3}</div>
              <div>{profile.city}</div>
              <div>{profile.county}</div>
              <div>{profile.state}</div>
              <div>{profile.zip}</div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="uppercase">
            <GraduationCap weight="bold" className="inline-icon mr-1" />
            {profile.school}
            {profile.graduationYear && `, class of ${profile.graduationYear}`}
          </h3>
        </div>

        {Boolean(profile.minHours) && (
          <div className="">
            <h4>
              <ChartPie
                weight="bold"
                className="inline w-[1.25em] h-[1.25em]"
              />{" "}
              {profile.minHours} hours minimum per week
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  dataKey="value"
                  labelLine={false}
                  data={pieData}
                  fill="#8884d8"
                  label={renderCustomLabel}
                  outerRadius={80}
                  cx="50%"
                  cy="50%"
                >
                  <LabelList
                    dataKey="name"
                    position="outside"
                    style={{ fontSize: "10px" }}
                    className="stroke-primary"
                  />
                  {pieData.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <h2 id="actions">
            <Gavel className="inline-icon" /> Actions
          </h2>
          <ul className="gap-2 flex flex-col">
            {/* .toReversed seems to not be in node version, just browser */}
            {profile.actions
              ?.slice(0)
              .reverse()
              .map((r: any) => {
                return (
                  <li
                    key={`${r.actionType}${r.date}`}
                    className="border-2 p-2 flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-center flex-wrap">
                      <div className="font-semibold">{r.actionType}</div>
                      {r.url && (
                        <>
                          <a
                            href={`https://web.archive.org/web/0/${r.url}`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium"
                          >
                            View PDF{" "}
                            {r.numPages > 0 && <>({r.numPages} pages)</>}
                          </a>
                        </>
                      )}
                    </div>

                    {r.url && r.offenses && (
                      <>
                        <ul className="list-disc list-inside">
                          <div className="font-medium">Offenses</div>
                          {r.offenses.map((o: string) => (
                            <li key={o}>{o}</li>
                          ))}
                        </ul>
                      </>
                    )}

                    <div className="flex flex-col gap-1">
                      {Object.keys(r).map((k) => {
                        if (
                          [
                            "offenses",
                            "actionType",
                            "date",
                            "url",
                            "numPages",
                          ].includes(k)
                        ) {
                          return null;
                        }
                        if (["history"].includes(k)) {
                          return Object.keys(r[k]).map((k2) => {
                            return (
                              <div key={k2} className="uppercase">
                                <span className="font-medium">{k2}:</span>{" "}
                                {r[k][k2]}
                              </div>
                            );
                          });
                        }
                        return (
                          <div key={k} className="uppercase">
                            <span className="font-medium">{k}:</span> {r[k]}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-end items-center">
                      <div className="w-fit uppercase flex items-center gap-1 bg-gray-100 text-gray-800 text-xs font-medium mr-2 px-1 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">
                        <ClockClockwise className="w-4 h-4" weight="bold" />
                        {r.date}
                      </div>
                    </div>
                  </li>
                );
              })}
          </ul>
        </div>
      </div>

      {/* dark color scheme messes up colors here */}
      <div className="min-h-[362px] [color-scheme:light]">
        <DiscussionEmbed
          shortname="physician-fyi"
          config={
            {
              // url: this.props.article.url,
              // identifier: this.props.article.id,
              // title: this.props.article.title,
              // language: 'zh_TW' //e.g. for Traditional Chinese (Taiwan)
            }
          }
        />
      </div>
    </div>
  );
}
