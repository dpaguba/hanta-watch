import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import CountryDrawer from "../components/CountryDrawer";
import { DashboardSkeleton, StatsSkeleton } from "../components/Skeleton";
import { useCountUp } from "../lib/motion";
import WorldMap from "../components/Map";
import OutbreakCard from "../components/OutbreakCard";
import StatusBar from "../components/StatusBar";
import Timeline from "../components/Timeline";
import VirusFilter from "../components/VirusFilter";
import {
  loadCountries,
  loadMeta,
  loadOutbreaks,
  loadTimeline,
} from "../data/loaders";
import type {
  CountryRecord,
  Meta,
  Outbreak,
  TimelinePoint,
} from "../data/types";
import { formatNumber } from "../lib/format";

type Tab = "outbreaks" | "country";

function Figure({ value, className }: { value: number; className?: string }) {
  const shown = useCountUp(value);
  return <span className={`hero-stat__value ${className ?? ""}`}>{formatNumber(shown)}</span>;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [meta, setMeta] = useState<Meta | null>(null);
  const [outbreaks, setOutbreaks] = useState<Outbreak[]>([]);
  const [countries, setCountries] = useState<CountryRecord[]>([]);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [virusFilter, setVirusFilter] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("outbreaks");
  const [hovered, setHovered] = useState<{ name: string; iso3: string | null } | null>(null);
  // Which tab the reader was on before the pointer wandered onto the map, so a
  // stray hover does not strand them on an empty Country panel.
  const tabBeforeHover = useRef<Tab | null>(null);

  function previewCountry(h: { name: string; iso3: string | null } | null) {
    setHovered(h);
    if (h) {
      if (tabBeforeHover.current === null) tabBeforeHover.current = tab;
      setTab("country");
      return;
    }
    const previous = tabBeforeHover.current;
    tabBeforeHover.current = null;
    if (previous) setTab(previous);
  }

  // Clicking a country opens its page. The side panel is the preview; the
  // detail page is the destination, so the panel no longer needs a link of
  // its own.
  function selectCountry(iso3: string) {
    navigate(`/countries/${iso3}`);
  }
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      loadMeta(),
      loadOutbreaks(),
      loadCountries(),
      loadTimeline(),
    ])
      .then(([m, ob, c, tl]) => {
        setMeta(m);
        setOutbreaks(ob);
        setCountries(c);
        setTimeline(tl);
        setLoaded(true);
      })
      .catch((e: unknown) => setError(String(e)));
  }, []);

  const virusOptions = useMemo(() => {
    const set = new Set<string>();
    for (const c of countries) for (const v of c.virus_species) set.add(v);
    return [...set].sort();
  }, [countries]);

  const filteredCountries = useMemo(
    () =>
      virusFilter
        ? countries.filter((c) => c.virus_species.includes(virusFilter))
        : countries,
    [countries, virusFilter],
  );

  const activeOutbreaks = outbreaks.filter(
    (o) => o.status === "active" || o.status === "monitored",
  );

  // When nothing is running, the headline covers the most recent event instead
  // of showing four zeroes. A quiet period is the normal state for hantavirus,
  // and an empty dashboard reads as a broken site rather than as good news.
  const featuredOutbreaks =
    activeOutbreaks.length > 0
      ? activeOutbreaks
      : [...outbreaks]
          .sort((a, b) => b.started.localeCompare(a.started))
          .slice(0, 1);
  const showingClosed = activeOutbreaks.length === 0 && featuredOutbreaks.length > 0;

  const totals = useMemo(() => {
    let cases = 0;
    let deaths = 0;
    for (const o of featuredOutbreaks) {
      cases += o.cases_confirmed;
      deaths += o.deaths;
    }
    const set = new Set(featuredOutbreaks.flatMap((o) => o.countries));
    return { cases, deaths, countries: set.size };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outbreaks]);


  // A data failure no longer discards the page. The hero, the explainers and the
  // reuse band need no data; only the dashboard does, and it says so.
  const dataFailed = error !== null;

  return (
    <>
      {/* HERO BAND, info-first: big yellow numbers on the right */}
      <section className="hero reveal">
        <div>
          <h1 className="hero__title t-display-xl">
            {"An open, sourced view of"}{" "}
            <span className="yellow">{"global hantavirus"}</span>{" "}
            {"activity"}
          </h1>
          <p className="hero__sub">{"Surveillance from WHO and ECDC, checked every hour, with early signals kept separate from confirmed counts. Most figures link to the document they came from; the rest are compiled estimates and say so."}</p>
          <div className="hero__cta">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() =>
                document
                  .getElementById("dashboard")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
            >
              {"Open the dashboard →"}
            </button>
            <Link className="btn btn--secondary" to="/data">
              {"Browse the data"}
            </Link>
          </div>
        </div>
        {!loaded && !dataFailed && <StatsSkeleton />}
        {(loaded || dataFailed) && (
        <div className="hero-stats" aria-label="Headline figures">
          <div className="hero-stat">
            <Figure value={totals.cases} className="yellow" />
            <span className="hero-stat__label">
              {showingClosed ? "Confirmed cases, most recent outbreak" : "Confirmed cases in active outbreaks"}
            </span>
          </div>
          <div className="hero-stat">
            <Figure value={totals.deaths} className="rose" />
            <span className="hero-stat__label">
              {showingClosed ? "Deaths, most recent outbreak" : "Deaths in active outbreaks"}
            </span>
          </div>
          <div className="hero-stat">
            <Figure value={totals.countries} />
            <span className="hero-stat__label">
              {"Countries involved"}
            </span>
          </div>
          <div className="hero-stat">
            <Figure value={showingClosed ? 0 : activeOutbreaks.length} className="yellow" />
            <span className="hero-stat__label">
              {"Active outbreaks"}
            </span>
          </div>
        </div>
        )}
      </section>

      <div className="section-head reveal" id="dashboard">
        <div className="section-head__row">
          <div>
            <p className="t-caps muted" style={{ marginBottom: 4 }}>
              {"Dashboard"}
            </p>
            <h2 className="t-display-md" style={{ margin: 0 }}>
              {"Map, time series and active outbreaks"}
            </h2>
          </div>
          <StatusBar meta={meta} />
        </div>
      </div>

      {/* DASHBOARD GRID */}
      {dataFailed ? (
        <div className="panel">
          <div className="panel__body">
            <p role="alert" className="muted">
              The datasets behind the dashboard did not load. Reload the page, or
              fetch them directly from the <Link to="/data">data page</Link>.
            </p>
          </div>
        </div>
      ) : !loaded ? (
        <DashboardSkeleton />
      ) : (
      <div className="dashboard">
        <div className="col">
          <section className="panel panel--map" aria-label={"Global map"}>
            <header className="panel__head">
              <h2>{"Global map"}</h2>
              <span className="panel__head-meta">
                {countries.length} {"countries"}
              </span>
            </header>
            <VirusFilter
              options={virusOptions}
              value={virusFilter}
              onChange={setVirusFilter}
            />
            <WorldMap
              onHoverCountry={previewCountry}
              countries={filteredCountries}
              outbreaks={featuredOutbreaks}
              onSelectCountry={selectCountry}
            />
            <div className="map-legend">
              <span>Low</span>
              <span className="map-legend__ramp" />
              <span>High cumulative cases</span>
            </div>
          </section>

          <section className="panel" aria-label={"Reported cases by period"}>
            <header className="panel__head">
              <h2>{"Reported cases by period"}</h2>
              <span className="panel__head-meta">CDC · PAHO · RIVM · ECDC</span>
            </header>
            <div className="panel__body">
              <Timeline points={timeline} />
            </div>
          </section>
        </div>

        <aside className="col">
          <section className="panel" aria-label="Side panel">
            <div className="tabs" role="tablist">
              <button
                role="tab"
                aria-selected={tab === "outbreaks"}
                className={tab === "outbreaks" ? "active" : ""}
                onClick={() => setTab("outbreaks")}
              >
                {showingClosed ? "Most recent outbreak" : "Active outbreaks"} · {featuredOutbreaks.length}
              </button>
              <button
                role="tab"
                aria-selected={tab === "country"}
                className={tab === "country" ? "active" : ""}
                onClick={() => setTab("country")}
              >
                Country
              </button>
            </div>
            <div className="panel__body--flush">
              {tab === "outbreaks" &&
                (featuredOutbreaks.length === 0 ? (
                  <p className="muted small" style={{ padding: "var(--s-lg)" }}>
                    No active outbreaks.
                  </p>
                ) : (
                  featuredOutbreaks.map((o) => (
                    <OutbreakCard key={o.id} outbreak={o} />
                  ))
                ))}
              {tab === "country" && (
                <div className="panel__body">
                  <CountryDrawer
                    country={
                      hovered?.iso3
                        ? (countries.find((c) => c.iso3 === hovered.iso3) ?? null)
                        : hovered
                          ? null
                          : null
                    }
                    fallbackName={hovered && !hovered.iso3 ? hovered.name : null}
                    outbreakNames={
                      hovered
                        ? featuredOutbreaks
                            .filter((o) =>
                              hovered.iso3 ? o.countries.includes(hovered.iso3) : false,
                            )
                            .map((o) => o.name)
                        : []
                    }
                  />
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
      )}

      {/* EXPLAINER: HPS / HFRS / H2H */}
      <section className="section-gap" aria-label={"What we track"}>
        <div className="section-head">
          <p className="t-caps muted">{"Hantaviruses cause two clinical syndromes worldwide"}</p>
          <h2 className="t-display-md">{"What we track"}</h2>
        </div>
        <div className="features">
          <article className="feature-card">
            <div className="feature-card__lead">HPS</div>
            <h3 className="t-title-lg">{"HPS (New World)"}</h3>
            <p className="muted" style={{ margin: 0 }}>
              {"Hantavirus pulmonary syndrome. ANDV, Sin Nombre, Choclo and related viruses. Higher case-fatality (30–40%). The Americas."}
            </p>
          </article>
          <article className="feature-card">
            <div className="feature-card__lead">HFRS</div>
            <h3 className="t-title-lg">{"HFRS (Old World)"}</h3>
            <p className="muted" style={{ margin: 0 }}>
              {"Haemorrhagic fever with renal syndrome. Hantaan, Seoul, Puumala, Dobrava. Lower CFR (0.1–12%). Eurasia."}
            </p>
          </article>
          <article className="feature-card">
            <div className="feature-card__lead">H2H</div>
            <h3 className="t-title-lg">{"Person-to-person"}</h3>
            <p className="muted" style={{ margin: 0 }}>
              {"Only Andes virus (ANDV) has documented human-to-human transmission. All other hantaviruses are rodent-borne via aerosolised excreta."}
            </p>
          </article>
        </div>
      </section>

      {/* CONTEXT: how to read the numbers */}
      <section className="section-gap" aria-label={"Why 11 cases can be bigger news than 30"}>
        <div className="section-head">
          <p className="t-caps muted">{"Reading the numbers"}</p>
          <h2 className="t-display-md">{"Why 11 cases can be bigger news than 30"}</h2>
          <p className="muted" style={{ maxWidth: "72ch", marginTop: 8 }}>
            {"Hantavirus surveillance is read as patterns, not totals. Three things make the 2026 cluster qualitatively different from a busy endemic year."}
          </p>
        </div>
        <div className="features">
          <article className="feature-card">
            <div className="feature-card__lead">{"Pattern, not count"}</div>
            <h3 className="t-title-lg">{"Cluster from one source ≠ scattered endemic cases"}</h3>
            <p className="muted" style={{ margin: 0 }}>
              {"30 Sin Nombre cases scattered across U.S. states in a year are endemic background: each one an isolated rodent-to-human event with no onward chain. 11 Andes cases linked to one ship in six weeks are an outbreak, with a single source, possible person-to-person spread, and dispersion across several countries."}
            </p>
          </article>
          <article className="feature-card">
            <div className="feature-card__lead">{"Geography"}</div>
            <h3 className="t-title-lg">{"Where the virus shouldn't be"}</h3>
            <p className="muted" style={{ margin: 0 }}>
              {"Andes virus lives in Patagonian rodents, in Argentina and Chile only. Finding it in the Netherlands, Spain, Germany or Canada means infected people carried it home. WHO publishes Disease Outbreak News about that dispersion across countries where the virus does not live, rather than about new local spread."}
            </p>
          </article>
          <article className="feature-card">
            <div className="feature-card__lead">{"What we count"}</div>
            <h3 className="t-title-lg">{"Hero stats track active events, not the baseline"}</h3>
            <p className="muted" style={{ margin: 0 }}>
              {"The top numbers show currently active and monitored outbreaks. Background endemic activity (thousands of cases a year in Argentina, Korea, Russia, Finland) lives on each Country page so the hero stays a signal, not a noise floor."}
            </p>
          </article>
        </div>
      </section>

      {/* YELLOW CTA BAND → /data */}
      <section className="cta-band section-gap" aria-label="Open dataset">
        <div>
          <h2 className="t-display-md" style={{ marginBottom: "var(--s-xs)" }}>
            {"Use our data, cite our sources"}
          </h2>
          <p style={{ margin: 0, maxWidth: "56ch" }}>{"Every dataset is plain JSON you can fetch directly. Most records carry the URL of the document behind them."}</p>
        </div>
        <Link className="btn btn--secondary" to="/data">
          {"View JSON API →"}
        </Link>
      </section>
    </>
  );
}
