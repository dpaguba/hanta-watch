# Hanta-Watch Public API

There is no traditional REST server; the "API" is a set of versioned JSON files
served as static assets. They update hourly.

## Base URL

When deployed:
```
https://dpaguba.github.io/hanta-watch/data/
```

Locally (after `npm run build` in `web/`):
```
/data/
```

## Endpoints

| Path | Purpose | Schema |
|---|---|---|
| `meta.json`              | Build metadata, per-source freshness | [`schema/meta.json`](#metajson) |
| `cases_by_country.json`  | Country-level cumulative snapshot   | [`schema/cases_by_country.json`](#cases_by_countryjson) |
| `cases_timeline.json`    | Time-series by country/period       | [`schema/cases_timeline.json`](#cases_timelinejson) |
| `outbreaks.json`         | Discrete outbreak events            | [`schema/outbreaks.json`](#outbreaksjson) |
| `news.json`              | Deduplicated news/signal feed       | [`schema/news.json`](#newsjson) |
| `reservoirs.json`        | Reservoir species + ranges          | reference data |
| `virus_species.json`     | Virus taxonomy                      | reference data |
| `feed.xml`               | RSS feed of significant changes     | RSS 2.0 |

## Schemas

All payloads carry
a top-level `schema_version: "1"`. Breaking changes bump the major.

### meta.json

```ts
type Meta = {
  schema_version: "1";
  generated_at: string;            // ISO 8601 UTC
  source_runs: Record<string, {
    ok: boolean;
    fetched_at: string;
    items: number;
    error?: string;
  }>;
};
```

### cases_by_country.json

```ts
type CountryRecord = {
  iso3: string;
  country: string;
  virus_species: string[];
  syndrome: "HPS" | "HFRS" | "mixed";
  cumulative_cases: number;
  cumulative_deaths: number;
  year_range: [number, number];
  last_case_reported: string | null;
  sources: { name: string; url: string; fetched_at: string }[];
};
```

### cases_timeline.json

```ts
type TimelinePoint = {
  iso3: string;
  period: string;       // "2023" or "2026-W18"
  cases: number;
  deaths: number;
  syndrome: "HPS" | "HFRS";
  virus_species?: string;
  source: string;
};
```

### outbreaks.json

```ts
type Outbreak = {
  id: string;                 // slug
  name: string;
  started: string;            // YYYY-MM-DD
  status: "active" | "monitored" | "closed";
  virus_species: string;
  syndrome: "HPS" | "HFRS";
  countries: string[];        // ISO3
  cases_confirmed: number;
  cases_probable: number;
  deaths: number;
  human_to_human: boolean;
  summary: string;
  sources: { name: string; url: string }[];
  timeline: { date: string; event: string }[];
};
```

### news.json

```ts
type NewsItem = {
  id: string;                  // sha256
  title: string;
  url: string;
  source: string;
  published_at: string;
  tags: string[];
  country_iso3: string[];
};
```

## Stability

- `schema_version: "1"` will be maintained until a major release.
- Field additions are non-breaking and may happen any time.
- Renames or removals require a major bump and a deprecation notice in

## Rate limits

None. The data is static, so fetch as often as you like. Please cache locally;
content changes at most once per hour.

## Attribution

See [`docs/data-license.md`](./data-license.md).
