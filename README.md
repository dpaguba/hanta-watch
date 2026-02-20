# Hanta-Watch

[![CI](https://github.com/dpaguba/hanta-watch/actions/workflows/ci.yml/badge.svg)](https://github.com/dpaguba/hanta-watch/actions/workflows/ci.yml)
[![ETL](https://github.com/dpaguba/hanta-watch/actions/workflows/etl.yml/badge.svg)](https://github.com/dpaguba/hanta-watch/actions/workflows/etl.yml)
[![Code licence: MIT](https://img.shields.io/badge/code-MIT-blue.svg)](./LICENSE)
[![Data licence: CC BY 4.0](https://img.shields.io/badge/data-CC%20BY%204.0-blue.svg)](./docs/data-license.md)

An open, sourced view of global hantavirus activity.

Hanta-Watch collects what public health agencies publish about hantavirus and
puts it on one page. Every figure keeps a link to the document it came from,
every dataset is a plain JSON file anyone can fetch, and the whole site is
static: a Python job writes the data, GitHub Actions runs it, Vercel serves
it.

The virus causes two syndromes, HPS in the Americas and HFRS across Eurasia,
carried by different rodent species and different virus species: Andes, Sin
Nombre, Puumala, Hantaan, Seoul, Dobrava. The site tracks both.

## Quickstart

```bash
# ETL: pull from the sources, write JSON into web/public/data/
cd etl
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m etl.run --offline   # --offline uses seed data only; omit it to fetch live
```

```bash
# Web
cd web
npm install
npm run dev        # http://localhost:5173
npm run build      # static site into web/dist/
```

## Architecture

```
GitHub Actions cron ──▶  etl/  ──▶  web/public/data/*.json  ──▶  web/  ──▶  Vercel
    hourly at :05       Python        schema_version "1"         Vite        static hosting
```

The ETL commits the JSON it produces, so the repository history is the audit
trail and the commit is also what triggers a rebuild of the site.

Sources run one after another and in isolation, so a source that fails does not
stop the others. Seed data is merged first, which means an offline run still
produces a coherent dataset. No live source can overwrite a figure; sources add
records and citations, and the numbers change when the agency that published
them changes them.

## Sources

| Source | What it contributes |
|---|---|
| [WHO Disease Outbreak News](https://www.who.int/emergencies/disease-outbreak-news) | Formal outbreak notifications |
| [ECDC](https://www.ecdc.europa.eu/en/infectious-disease-topics/hantavirus-infection) | European surveillance and situation updates |
| Google News | Early signals, never counted as cases |

CDC surveillance and ProMED were sources until August 2026. CDC now answers
automated clients with 403, and ProMED moved its search to a client-rendered
page with no feed, so both were removed rather than left to fail every hour.
United States figures on the site are historical and keep their original
citations.

## Stack

- **Frontend**: Vite, React 18, TypeScript. Choropleth on `react-simple-maps`,
  charts on `recharts`, routing on `react-router-dom`. English only.
- **ETL**: Python 3.10+ with `httpx` and `feedparser`.
- **Hosting**: Vercel, rebuilt on every push to `main`.

## Deployment

The site is static, with no server side of its own.
[`vercel.json`](./vercel.json) carries the whole configuration, so importing the
repository on Vercel needs nothing set in the dashboard: leave the root
directory at the repository root and deploy.

| Setting | Value |
|---|---|
| Install | `npm --prefix web ci` |
| Build | `npm --prefix web run build` |
| Output | `web/dist` |

Routing happens in the browser, so every path that is not a file rewrites to
`index.html`. Static files win over that rule, which is what keeps
`/data/*.json` fetchable.

The hourly ETL commits its JSON to `main`, and that push is what rebuilds the
site. GitHub deliberately does not start workflows from a push made with
`GITHUB_TOKEN`, but the Vercel integration is a webhook and receives it, so the
published data stays in step with the repository.

## Testing

```bash
(cd etl && ruff check . && pytest -q)
(cd web && npm run lint && npm run typecheck && npm test -- --run && npm run build)
```

Each line runs in a subshell, so both start from the repository root. `ruff` and
`pytest` are not in `requirements.txt`; install them with
`pip install ruff pytest`.

## Documentation

- [`docs/methodology.md`](./docs/methodology.md), what is counted and what is
  deliberately not attempted.
- [`docs/api.md`](./docs/api.md), the public JSON API.
- [`docs/data-license.md`](./docs/data-license.md), data licences and attribution.

## Licence

Code is [MIT](./LICENSE). The compiled datasets under `web/public/data/` and
`data/snapshots/` are CC BY 4.0, and the primary sources travel with each record
in its `sources` field.

Records derived from WHO Disease Outbreak News carry WHO's own terms, CC BY-NC-SA
3.0 IGO, which do not permit commercial use without permission. Check
[`docs/data-license.md`](./docs/data-license.md) before redistributing
commercially.

## Disclaimer

Hanta-Watch is an independent project with no affiliation to WHO, ECDC, PAHO or
any other public health authority, and no endorsement from them. It is not a
medical service. For anything concerning your own health, talk to a doctor.
