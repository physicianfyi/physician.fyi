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
