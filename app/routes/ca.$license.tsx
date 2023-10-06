import type { DataFunctionArgs, LinksFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { DiscussionEmbed } from "disqus-react";
import fs from "fs";

export const links: LinksFunction = () => [
  {
    rel: "icon",
    href: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔍</text></svg>",
  },
];

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

  const data = JSON.parse(fs.readFileSync("data/ca/clean.json", "utf8"));
  const profile = data.profiles[license];

  const read = JSON.parse(fs.readFileSync("data/ca/read.json", "utf8")).results;

  for (let action of profile.actions ?? []) {
    const url = action.url;
    if (!url) continue;

    const parsedUrl = new URL(url);
    const did = parsedUrl.searchParams.get("did");
    const path = `${did}.pdf.txt`;

    if (read[path]) {
      action.offenses = read[path];
    }
  }

  return { profile, license };
};

export default function Route() {
  // const params = useParams()
  const { profile, license } = useLoaderData<typeof loader>();

  return (
    <div className="p-8 flex flex-col gap-4">
      {/* Just so the disqus thing changing height doesn't show on load */}
      <div className="min-h-screen flex flex-col gap-8">
        <div className="">
          <h1 className="uppercase">{profile.name}</h1>
          <h4>
            California License <span className="uppercase">{license}</span>
          </h4>

          <h3 className="uppercase">
            {profile.school}
            {profile.graduationYear && `, class of ${profile.graduationYear}`}
          </h3>

          {profile.survey?.["PRIMARY AREA OF PRACTICE"] && (
            <h4>
              Specialty: {profile.survey["PRIMARY AREA OF PRACTICE"]}
              {profile.survey?.["SECONDARY AREA OF PRACTICE"] && ", "}
              {profile.survey?.["SECONDARY AREA OF PRACTICE"]?.join(", ")}
            </h4>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <h2 id="actions">Actions</h2>
          <ul className="gap-2 flex flex-col">
            {profile.actions?.map((r: any) => {
              return (
                <li key={`${r.actionType}${r.date}`} className="border-2 p-2">
                  <div>{r.actionType}</div>
                  {r.url && (
                    <a
                      href={`https://web.archive.org/web/0/${r.url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium"
                    >
                      View PDF
                    </a>
                  )}
                  <ul className="list-disc list-inside">
                    {r.offenses?.map((o: string) => (
                      <li key={o}>{o}</li>
                    ))}
                  </ul>
                  <div>{r.date}</div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="min-h-[362px]">
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
