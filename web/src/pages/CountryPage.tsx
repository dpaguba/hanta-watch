import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { PageSkeleton } from "../components/Skeleton";
import Timeline from "../components/Timeline";
import {
  loadCountries,
  loadReservoirs,
  loadTimeline,
  loadVirusSpecies,
} from "../data/loaders";
import type {
  CountryRecord,
  Reservoir,
  TimelinePoint,
  VirusSpecies,
} from "../data/types";
import { formatNumber } from "../lib/format";

export default function CountryPage() {
  const { iso3 } = useParams();
  const [country, setCountry] = useState<CountryRecord | null>(null);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [viruses, setViruses] = useState<VirusSpecies[]>([]);
  const [reservoirs, setReservoirs] = useState<Reservoir[]>([]);

  // Which country the loaded data belongs to. While it lags behind the route
  // parameter the page is still loading, so no state has to be written
  // synchronously when the route changes.
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      loadCountries(),
      loadTimeline(),
      loadVirusSpecies(),
      loadReservoirs(),
    ])
      .then(([c, tl, v, r]) => {
        if (cancelled) return;
        setCountry(c.find((x) => x.iso3 === iso3) ?? null);
        setTimeline(tl);
        setViruses(v);
        setReservoirs(r);
        setFailed(false);
        setLoadedFor(iso3 ?? null);
      })
      .catch(() => {
        if (cancelled) return;
        setFailed(true);
        setLoadedFor(iso3 ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [iso3]);

  if (loadedFor !== (iso3 ?? null)) return <PageSkeleton cards={2} />;

  if (failed || !country)
    return (
      <article className="about">
        <p className="small country-page__back">
          <Link to="/">← {"Overview"}</Link>
        </p>
        <h1 className="t-display-lg about__title">
          {failed ? "Data could not be loaded" : `No record for ${iso3}`}
        </h1>
        <p className="about__lede">
          {failed
            ? "The datasets behind this page did not load. Reload the page, or check the status bar on the overview."
            : "This country has no hantavirus record in the dataset. It may appear in an outbreak or in the timeline without a country-level entry of its own."}
        </p>
      </article>
    );

  const seriesTotal = timeline
    .filter((p) => p.iso3 === country.iso3)
    .reduce((sum, p) => sum + p.cases, 0);

  const countryViruses = viruses.filter((v) => country.virus_species.includes(v.id));
  const countryReservoirs = reservoirs.filter(
    (r) =>
      r.range_countries.includes(country.iso3) ||
      r.range_countries.includes("WORLDWIDE"),
  );

  return (
    <article className="about country-page">
      <p className="small country-page__back">
        <Link to="/">← {"Overview"}</Link>
      </p>

      <header className="about__hero reveal">
        <div>
          <p className="t-caps muted">
            {country.syndrome} · {country.virus_species.join(" · ")}
          </p>
          <h1 className="t-display-lg about__title">{country.country}</h1>
          <p className="about__lede">
            {country.cumulative_cases > 0
              ? `${country.estimate ? "An estimated " : ""}${formatNumber(country.cumulative_cases)} cumulative cases and ${formatNumber(country.cumulative_deaths)} deaths${country.estimate ? " compiled from the literature" : " on record"}${
                  country.year_range
                    ? `, spanning ${country.year_range[0]} to ${country.year_range[1]}`
                    : ""
                }.`
              : "No cumulative case count published for this country yet."}
          </p>
        </div>
        <aside className="about__facts">
          <div className="about__fact">
            <span className="about__fact-value yellow">
              {formatNumber(country.cumulative_cases)}
            </span>
            <span className="about__fact-label">
              Cumulative cases{country.estimate ? " (estimate)" : ""}
            </span>
          </div>
          <div className="about__fact">
            <span className="about__fact-value rose">
              {formatNumber(country.cumulative_deaths)}
            </span>
            <span className="about__fact-label">
              Cumulative deaths{country.estimate ? " (estimate)" : ""}
            </span>
          </div>
          <div className="about__fact">
            <span className="about__fact-value">
              {country.year_range ? `${country.year_range[0]}–${country.year_range[1]}` : "n/a"}
            </span>
            <span className="about__fact-label">Year range</span>
          </div>
          <div className="about__fact">
            <span className="about__fact-value">{country.iso3}</span>
            <span className="about__fact-label">ISO-3 code</span>
          </div>
        </aside>
      </header>

      <section className="about__block reveal">
        <p className="t-caps muted">Trend</p>
        <h2 className="t-display-sm">Reported cases by period</h2>
        <div className="panel">
          <div className="panel__body">
            <Timeline points={timeline} iso3={country.iso3} />
          </div>
        </div>
        {seriesTotal > 0 && seriesTotal !== country.cumulative_cases && (
          <p className="about__note muted small">
            This series adds up to {formatNumber(seriesTotal)} cases, against a
            cumulative figure of {formatNumber(country.cumulative_cases)}. The
            two come from different publications and the annual breakdown does
            not cover every year, so the totals do not match. Neither number has
            been adjusted to fit the other.
          </p>
        )}
      </section>

      <section className="about__block reveal">
        <p className="t-caps muted">Virology</p>
        <h2 className="t-display-sm">What circulates here</h2>
        {countryViruses.length === 0 ? (
          <p className="about__note muted small">No virus species mapped to this country.</p>
        ) : (
          <div className="about__grid">
            {countryViruses.map((v) => (
              <article key={v.id} className="panel">
                <header className="panel__head">
                  <h3>{v.name}</h3>
                  <span className="panel__head-meta">{v.syndrome}</span>
                </header>
                <div className="panel__body country-page__virus">
                  <div>
                    <span className="about__fact-value">{v.case_fatality_pct ?? "n/a"}</span>
                    <span className="about__fact-label">Case fatality %</span>
                  </div>
                  <div>
                    <span className="about__fact-value">{v.human_to_human ? "Yes" : "No"}</span>
                    <span className="about__fact-label">Human to human</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="about__block reveal">
        <p className="t-caps muted">Ecology</p>
        <h2 className="t-display-sm">Reservoir species</h2>
        {countryReservoirs.length === 0 ? (
          <p className="about__note muted small">No reservoir mapped for this country.</p>
        ) : (
          <div className="about__rules">
            {countryReservoirs.map((r) => (
              <article key={r.id} className="about__rule">
                <span className="about__rule-num">●</span>
                <div>
                  <h3>{r.common_name}</h3>
                  <p>
                    {r.scientific_name}. Carries {r.carries.join(", ")}.
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="about__block reveal">
        <p className="t-caps muted">Provenance</p>
        <h2 className="t-display-sm">Sources</h2>
        <div className="about__links">
          {country.sources.map((s) => (
            <a key={s.url} href={s.url} target="_blank" rel="noreferrer noopener">
              {s.name}
            </a>
          ))}
        </div>
      </section>
    </article>
  );
}
