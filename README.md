# Welcome to physician.fyi!

- [Remix Docs](https://remix.run/docs)
- [TailwindCSS](https://tailwindcss.com/docs)
- [ArkType](https://arktype.io/docs/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [ESLint](https://eslint.org/docs/latest/)

## Development

### Data generation

#### Add a state

Follow the pattern for other states. Run scripts using something like `npx tsx generate/[state]/[script]`, which typically produces a file with the same name in `data/[state]/[script]`.

1. You will start by scraping the data. With California and Florida so far, it's been necessary to do this in two steps, scrape-shallow followed by scrape-deep for extra info that wasn't available from the shallow source.

- Do not clean or modify the data in this step—it's best to have as close to the raw data as possible stored so that we can efficiently change things about it by reading it from disk instead of having to rescrape each time we change something about how it's cleaned/transformed.
- Don't store data that was in the shallow scrape file again in the deep scrape file—we check these files in to version control via `git lfs track [file]` and have a space limit. The cleaning step also merges these files.

2. If you're proceeding to the PDF processing, you will typically do that now, because the cleaning step will also read from this. But you can skip this step on your initial run through and come back to it.
3. Now you clean.
4. Then you summarize.
5. Then you geocode.

You want to produce several files in the directory `data/[state]`:

- clean.json (required) with a schema like:
  - ```
    {
      "profiles": {
        [licenseNumber]: {
          "name": "last, first middle",
          "licenseType": "medical doctor",
          "licenseUrl": "/HealthCareProviders/LicenseVerification?LicInd=10&ProCde=1501",
          "address": "PO BOX 745",
          "city": "STUART",
          "zip": "34995-0745",
          "state": "FL",
          "county": "MARTIN",
          "licenseStatus": "license surrendered",
          "actions": [
            {
              "actionType": "voluntary surrender",
              "date": "5/16/1985",
              ...[any other entries]...
            }
          ]
        }
      }
    }
    ```
- summarize.json (required)
- read.json (optional, used to populate offenses filter)
- geocode.json (optional, used to populate map)

### Running app

From your terminal:

```sh
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.
