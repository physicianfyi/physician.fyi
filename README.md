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
- Write the scraper so that subsequent runs preserve previously scraped data to protect against the source unpublishing data. A notable case here will be only ever adding to the actions list for each doctor if a new action is found.

2. If you're proceeding to the PDF processing, you will typically do that now, because the cleaning step will also read from this. But you can skip this step on your initial run through and come back to it.

- Download PDFs from URLs in actions from the scrape step above
- Convert PDFs to PNGs for Tesseract
- OCR the PNGs
- Write a script called read which outputs read.json which identifies offenses from the text files

3. Now you clean. Normalize values to be consistent with common values used in the app. If a field has bad data (e.g., address is "n/a") remove it.
4. Now you summarize. I like to cycle between clean and summarize to see bad data or data that can be normalized.

- Note summarize is meant to preserve existing data, so if you are removing or changing values in clean, delete summarize.json before rerunning summarize to get rid of the outdated values completely.

5. Now you geocode. Store the query that ended up being used for the geocode so that we can go back and check.

You want to produce several files in the directory `data/[state]`:

- clean.json (required) with a schema like:
  - ```
    {
      "baseUrl": "[base url for licenseUrl]",
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
          "country": "",
          "licenseStatus": "license surrendered",
          "actions": [
            {
              "actionType": "voluntary surrender",
              "date": "[DD/MM/YYYY or MM/DD/YYYY or month day, year]",
              ...[any other entries]...
            }
          ],
          "specialties": ["DERMATOLOGY"]
        }
      }
    }
    ```
- summarize.json (required)
- read.json (optional, used to populate offenses filter)
- geocode.json (optional, used to populate map)

Lastly you want to add the state in `app/services/constants`

### Running app

From your terminal:

```sh
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.
