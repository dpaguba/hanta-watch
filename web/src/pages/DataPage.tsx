import { useEffect, useState } from "react";

import { loadMeta } from "../data/loaders";
import type { Meta } from "../data/types";

const SAMPLE_JSON = `{
  "id": "mv-hondius-2026",
  "virus_species": "ANDV",
  "syndrome": "HPS",
  "countries": ["NLD","ARG","ESP","CAN","DEU","FRA","GBR"],
  "cases_confirmed": 9,
  "cases_probable": 2,
  "deaths": 3,
  "human_to_human": true,
  "sources": [
    { "name": "WHO DON", "url": "..." },
    { "name": "ECDC",    "url": "..." }
  ]
}`;

const ENDPOINTS: { file: string; desc: string }[] = [
  { file: "meta.json", desc: "Timestamp of the last run, schema version, and the status of every source." },
  { file: "outbreaks.json", desc: "Active and monitored outbreaks with timelines and source links." },
  { file: "cases_by_country.json", desc: "Cumulative cases, deaths, year range and virus species per country." },
  { file: "cases_timeline.json", desc: "Case counts per country and syndrome. Most points are annual; recent ones may be ISO weeks. Historical United States points keep their CDC citations." },
  { file: "news.json", desc: "News and signals tagged by country." },
  { file: "virus_species.json", desc: "Virus species reference: syndrome, case-fatality rate, reservoir IDs." },
  { file: "reservoirs.json", desc: "Rodent reservoir species and the countries they range across." },
  { file: "countries.json", desc: "ISO-3 code to country name and centroid for map plotting." },
  { file: "feed.xml", desc: "RSS 2.0 feed of news and signal items." },
];

export default function DataPage() {
  const [meta, setMeta] = useState<Meta | null>(null);
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");

  useEffect(() => {
    loadMeta()
      .then(setMeta)
      .catch(() => null);
  }, []);

  return (
    <>
      <section className="hero">
        <div>
          <h1 className="hero__title t-display-xl">
            {"Open"}{" "}
            <span className="yellow">{"JSON API"}</span>
          </h1>
          <p className="hero__sub">{"The pipeline runs hourly. News and run metadata change with it; compiled case figures change when the publishing agency changes them. Published under CC BY 4.0, with WHO-derived records carrying WHO's non-commercial terms."}</p>
          <div className="hero__cta">
            <a
              className="btn btn--primary"
              href={`${base}/data/outbreaks.json`}
              target="_blank"
              rel="noreferrer noopener"
            >
              {"Download outbreaks.json"}
            </a>
            <a
              className="btn btn--secondary"
              href={`${base}/data/feed.xml`}
              target="_blank"
              rel="noreferrer noopener"
            >
              {"RSS feed"}
            </a>
          </div>
        </div>
        <div>
          <div className="panel">
            <header className="panel__head">
              <h2>outbreaks.json</h2>
              <span className="panel__head-meta t-mono">
                {`Schema v${meta?.schema_version ?? "1"}`}
              </span>
            </header>
            <pre
              className="code-window"
              style={{ margin: 0, border: 0, borderRadius: 0 }}
            >
              {SAMPLE_JSON}
            </pre>
          </div>
        </div>
      </section>

      <section className="panel section-gap" aria-label={"Endpoints"}>
        <header className="panel__head">
          <h2>{"Endpoints"}</h2>
          <span className="panel__head-meta">CC BY 4.0</span>
        </header>
        <div className="scroll-x">
          <table className="timeline-table">
            <thead>
              <tr>
                <th>{"Endpoint"}</th>
                <th>{"Description"}</th>
                <th aria-label={"open"} />
              </tr>
            </thead>
            <tbody>
              {ENDPOINTS.map((e) => (
                <tr key={e.file}>
                  <td className="t-mono" style={{ whiteSpace: "nowrap" }}>
                    /data/{e.file}
                  </td>
                  <td>{e.desc}</td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <a
                      href={`${base}/data/${e.file}`}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {"open"} ↗
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="features section-gap">
        <article className="feature-card">
          <div className="feature-card__lead">CC BY 4.0</div>
          <h3 className="t-title-lg">{"CC BY 4.0"}</h3>
          <p className="muted" style={{ margin: 0 }}>
            {"CC BY 4.0 with attribution. WHO-derived records carry WHO's non-commercial terms. Cite primary sources from sources[]."}
          </p>
        </article>
        <article className="feature-card">
          <div className="feature-card__lead">schema_version</div>
          <h3 className="t-title-lg">{"Stable schema"}</h3>
          <p className="muted" style={{ margin: 0 }}>
            {"Every payload carries schema_version. Breaking changes bump the major version."}
          </p>
        </article>
        <article className="feature-card">
          <div className="feature-card__lead">hourly</div>
          <h3 className="t-title-lg">{"Hourly cadence"}</h3>
          <p className="muted" style={{ margin: 0 }}>
            {"GitHub Actions runs at :05 each hour. meta.json reports per-source success."}
          </p>
        </article>
      </section>
    </>
  );
}
