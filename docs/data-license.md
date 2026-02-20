# Data License

The **aggregated and normalized datasets** produced by Hanta-Watch and published in
`web/public/data/*.json` and `data/snapshots/` are released under the
[Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/) license.

You may share and adapt the data for any purpose, including commercially, as long as you
provide attribution.

## Required attribution

```
Hanta-Watch (https://github.com/dpaguba/hanta-watch), accessed YYYY-MM-DD.
Primary sources cited in each record.
```

## Underlying primary data

Each record in our JSON includes a `sources[]` array pointing to the **primary
publisher**. Their licenses apply to their content:

| Publisher | License / status |
|---|---|
| WHO Disease Outbreak News | CC BY-NC-SA 3.0 IGO, non-commercial unless permission obtained |
| US CDC (HPS surveillance, NNDSS) | Public domain (US government work) |
| ECDC | Free to use with citation |
| Google News (search feed) | Headlines and links only; each item links to its publisher |
| PAHO, RKI, KDCA, Rospotrebnadzor, THL, Folkhälsomyndigheten, Santé publique France, RIVM | National and regional surveillance publications, cited per record |
| Published literature (via PubMed) | Cited per record; figures are estimates |
| PAHO | Free to use with citation |
| News outlets (CIDRAP, Reuters, etc.) | Headlines + URLs only; full content stays with the publisher |

Hanta-Watch only stores **headlines, URLs, dates, and structured surveillance numbers**.
We do not republish full article text.

## What you must do

1. Cite Hanta-Watch as the aggregator.
2. Cite the primary publisher from `sources[]` when republishing a specific number.
3. Do not claim WHO/CDC/etc. endorsement.

## What you must not do

- Remove the `sources[]` attribution from re-distributed JSON.
- Add or invent records and attribute them to Hanta-Watch.
