import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Counter from "../components/Counter";
import { PageSkeleton } from "../components/Skeleton";
import { loadOutbreaks } from "../data/loaders";
import type { Outbreak } from "../data/types";
import { formatNumber } from "../lib/format";

export default function OutbreakPage() {
  const { id } = useParams();
  const [ob, setOb] = useState<Outbreak | null>(null);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadOutbreaks()
      .then((list) => {
        if (cancelled) return;
        setOb(list.find((o) => o.id === id) ?? null);
        setFailed(false);
        setLoadedFor(id ?? null);
      })
      .catch(() => {
        if (cancelled) return;
        setFailed(true);
        setLoadedFor(id ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loadedFor !== (id ?? null)) return <PageSkeleton cards={2} />;

  if (failed || !ob)
    return (
      <article className="about">
        <p className="small country-page__back">
          <Link to="/">← {"Overview"}</Link>
        </p>
        <h1 className="t-display-lg about__title">
          {failed ? "Data could not be loaded" : "Outbreak not found"}
        </h1>
        <p className="about__lede">
          {failed
            ? "The outbreak dataset did not load. Reload the page, or check the status bar on the overview."
            : "No outbreak with this identifier is in the dataset."}
        </p>
      </article>
    );

  return (
    <article>
      <p className="small">
        <Link to="/">← {"Overview"}</Link>
      </p>
      <h1 className="t-display-md" style={{ margin: "var(--s-xs) 0" }}>
        {ob.name}
      </h1>
      <p className="muted small" style={{ marginTop: 0, marginBottom: "1rem" }}>
        <span className="outbreak__tag">{ob.virus_species}</span>{" "}
        <span className="outbreak__tag">{ob.syndrome}</span>{" "}
        <span className="outbreak__tag">{ob.status}</span>
        {ob.human_to_human && (
          <>
            {" "}
            <span className="outbreak__tag outbreak__tag--h2h">
              {"Person-to-person transmission"}
            </span>
          </>
        )}{" "}
        · started {ob.started}
      </p>

      <div className="kpis">
        <Counter
          label={"confirmed"}
          value={formatNumber(ob.cases_confirmed)}
          tone="signal"
        />
        <Counter
          label={"probable"}
          value={formatNumber(ob.cases_probable)}
        />
        <Counter
          label={"deaths"}
          value={formatNumber(ob.deaths)}
          tone="danger"
        />
        <Counter
          label={"countries"}
          value={ob.countries.length}
          sub={ob.countries.join(", ")}
        />
      </div>

      <section className="panel">
        <header className="panel__head">
          <h2>{"Summary"}</h2>
        </header>
        <div className="panel__body">
          <p style={{ margin: 0 }}>{ob.summary}</p>
        </div>
      </section>

      <section className="panel" style={{ marginTop: "1rem" }}>
        <header className="panel__head">
          <h2>{"Timeline"}</h2>
        </header>
        <table className="timeline-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Event</th>
            </tr>
          </thead>
          <tbody>
            {ob.timeline.map((e) => (
              <tr key={e.date + e.event}>
                <td>{e.date}</td>
                <td>{e.event}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel" style={{ marginTop: "1rem" }}>
        <header className="panel__head">
          <h2>{"Sources"}</h2>
        </header>
        <div className="panel__body">
          <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
            {ob.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noreferrer noopener">
                  {s.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </article>
  );
}
