# Methodology

How Hanta-Watch turns scattered surveillance into a coherent dataset.

## What we count

A case is included only when a public health agency publishes it. News items
surface signals that populate the news feed and never move a case count.

We track two clinical syndromes separately:

- **HPS** (Hantavirus Pulmonary Syndrome), Americas-dominant: Sin Nombre, Andes,
  Bayou, Black Creek Canal, Choclo and others.
- **HFRS** (Hemorrhagic Fever with Renal Syndrome), Eurasia-dominant: Hantaan,
  Seoul, Puumala, Dobrava-Belgrade and others.

Each record carries `syndrome` and, where known, `virus_species`. Confirmed and
probable cases stay in separate fields and are never added together.

## Where the numbers come from

Most country-level figures are compiled by hand from published surveillance and
from the literature, with the compilation date recorded in each citation rather
than the time of the run that published them. Where a figure is an estimate, the
source name says so.

The live sources are WHO Disease Outbreak News, ECDC and a Google News search.
They add records and citations. None of them overwrites a case count: a number
changes when the agency that published it changes it, and someone updates the
compiled figure to match.

## What we do not do

- **No patient-level data.** Agencies aggregate to protect patient identity, and
  we do not attempt to reverse that aggregation.
- **No automated geocoding of patient locations.** Country or region only.
- **No social media as a primary source.** Twitter/X, Reddit and the rest are
  not ingested.
- **No disease modelling or forecasting.** We report what authorities publish.
  Modelling belongs in a peer-reviewed paper.

## Update cadence

The ETL runs hourly at :05 through GitHub Actions. Within a run, sources are
queried one after another, each with a 30 second timeout. A failed source does
not block the others.

Each run records one of three states per source in `meta.json.source_runs`:
`ok` when records arrived, `empty` when the source answered and had nothing to
say, and `error` when it could not be read. The status bar on the dashboard
shows all three, in words. WHO publishes a hantavirus notification a few times a
year, so `empty` is its normal state and is not a failure.

## Deduplication

- **News** items are deduplicated by SHA-256 of `lower(normalize(title)) + host`.
- **Outbreak** records are merged by `id`, a slug such as `mv-hondius-2026`.
  Sources may append citations to an outbreak they cover; they cannot change its
  figures.

## Reproducibility

- The full ETL is open source, under `/etl`.
- Every run commits the resulting `web/public/data/*.json`, so the file history
  is the audit trail.
- `data/snapshots/` keeps CSV dumps for long-term archival.

## Corrections

Open an issue with a link to the published document, not to a homepage. Factual
errors are acted on quickly; cosmetic fixes ship with the next run.
