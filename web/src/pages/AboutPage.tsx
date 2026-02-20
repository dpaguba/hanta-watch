const REPO = "https://github.com/dpaguba/hanta-watch";

const SOURCES = [
  {
    name: "WHO Disease Outbreak News",
    role: "Confirmed outbreaks",
    detail:
      "Formal notifications from the World Health Organization. The slowest source here, and the one with the highest bar for confirmation.",
    url: "https://www.who.int/emergencies/disease-outbreak-news",
  },
  {
    name: "ECDC",
    role: "European surveillance",
    detail:
      "Situation updates and risk assessments for Europe, including the Andes hantavirus pages that cover the current cluster.",
    url: "https://www.ecdc.europa.eu/en/infectious-disease-topics/hantavirus-infection",
  },
  {
    name: "Google News",
    role: "Early signals",
    detail:
      "A search feed, kept in its own column. Nothing arriving here is counted as a case; it exists to show something before an agency publishes.",
    url: "https://news.google.com/",
  },
];

const RULES = [
  {
    title: "Confirmed and probable stay apart",
    body: "The two columns are never added together. Agencies define them differently, and a combined figure would hide which is which.",
  },
  {
    title: "Only the publisher moves a number",
    body: "A case count changes when the agency that published it changes it. News items never move a count.",
  },
  {
    title: "Fatality rates come from the literature",
    body: "Case-fatality figures are the published values per virus species, not our two columns divided by each other.",
  },
  {
    title: "No modelling, no forecasts",
    body: "Case counts this small would produce projections that describe the model rather than the disease. The site reports what was published and when.",
  },
];

const LINKS = [
  { label: "Methodology", href: `${REPO}/blob/main/docs/methodology.md` },
  { label: "Data licence", href: `${REPO}/blob/main/docs/data-license.md` },
  { label: "API reference", href: `${REPO}/blob/main/docs/api.md` },
  { label: "Source code", href: REPO },
];

export default function AboutPage() {
  const feed = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/data/feed.xml`;

  return (
    <article className="about">
      <header className="about__hero reveal">
        <div>
          <p className="t-caps muted">About</p>
          <h1 className="t-display-lg about__title">
            Everything here keeps a link to where it came from
          </h1>
          <p className="about__lede">
            Hanta-Watch collects what public health agencies publish about
            hantavirus and puts it on one page. Every figure carries the
            document behind it, so you can check the number instead of trusting
            the site.
          </p>
        </div>
        <aside className="about__facts">
          <div className="about__fact">
            <span className="about__fact-value yellow">3</span>
            <span className="about__fact-label">Live sources</span>
          </div>
          <div className="about__fact">
            <span className="about__fact-value">9</span>
            <span className="about__fact-label">Open datasets</span>
          </div>
          <div className="about__fact">
            <span className="about__fact-value">1h</span>
            <span className="about__fact-label">Refresh interval</span>
          </div>
          <div className="about__fact">
            <span className="about__fact-value">CC BY 4.0</span>
            <span className="about__fact-label">Data licence</span>
          </div>
        </aside>
      </header>

      <section className="about__block reveal">
        <p className="t-caps muted">Sources</p>
        <h2 className="t-display-sm">Where the numbers come from</h2>
        <p className="about__note">
          Each source runs on its own. When one fails the others still publish,
          and the failure shows in the status bar on the dashboard rather than
          disappearing quietly.
        </p>
        <div className="about__grid">
          {SOURCES.map((s) => (
            <article key={s.name} className="panel about__source">
              <header className="panel__head">
                <h3>{s.name}</h3>
                <span className="panel__head-meta">{s.role}</span>
              </header>
              <div className="panel__body">
                <p>{s.detail}</p>
                <a href={s.url} target="_blank" rel="noreferrer noopener">
                  Visit source
                </a>
              </div>
            </article>
          ))}
        </div>
        <p className="about__note muted small">
          CDC surveillance was a source until August 2026. Its edge now answers
          automated clients with 403, and the annual tables that replaced the
          old pages stop at 2022, so the feed was removed rather than left to
          fail every hour. United States figures on this site are historical and
          keep their original citations.
        </p>
      </section>

      <section className="about__block reveal">
        <p className="t-caps muted">Method</p>
        <h2 className="t-display-sm">How a case gets counted</h2>
        <div className="about__rules">
          {RULES.map((r, i) => (
            <article key={r.title} className="about__rule">
              <span className="about__rule-num">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3>{r.title}</h3>
                <p>{r.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="about__block reveal">
        <p className="t-caps muted">Reuse</p>
        <h2 className="t-display-sm">Take the data</h2>
        <p className="about__note">
          The data is CC BY 4.0, the code is MIT, and the primary sources travel
          with each record in its <code>sources</code> field. Every dataset
          behind this page is a plain JSON file you can fetch directly.
        </p>
        <div className="about__links">
          {LINKS.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noreferrer noopener">
              {l.label}
            </a>
          ))}
          <a href={feed}>RSS feed</a>
        </div>
      </section>

      <p className="about__disclaimer muted small">
        Hanta-Watch is an independent project with no affiliation to WHO, ECDC,
        PAHO or any other public health authority, and no endorsement from them.
        It is not a medical service. For anything concerning your own health,
        talk to a doctor.
      </p>
    </article>
  );
}
