import { useEffect, useMemo, useState } from "react";

import { loadNews } from "../data/loaders";
import type { NewsItem } from "../data/types";
import { PageSkeleton } from "../components/Skeleton";
import { relativeTime } from "../lib/format";

/** Returns an embeddable player URL when the link is a video, otherwise null.
 *
 * The feeds carry ordinary articles most weeks, so this is checked rather than
 * assumed, and the page falls back to the newest article when nothing matches.
 */
function embedUrl(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtube.com" || host === "m.youtube.com") {
    const id = url.searchParams.get("v") ?? url.pathname.match(/^\/(?:embed|shorts)\/([\w-]{11})/)?.[1];
    return id && /^[\w-]{11}$/.test(id)
      ? `https://www.youtube-nocookie.com/embed/${id}`
      : null;
  }
  if (host === "youtu.be") {
    const id = url.pathname.slice(1);
    return /^[\w-]{11}$/.test(id)
      ? `https://www.youtube-nocookie.com/embed/${id}`
      : null;
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = url.pathname.match(/(\d+)/)?.[1];
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }
  return null;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadNews()
      .then((n) => {
        setNews(n);
        setLoaded(true);
      })
      .catch(() => {
        setError(true);
        setLoaded(true);
      });
  }, []);

  const sorted = useMemo(
    () =>
      [...news].sort(
        (a, b) => Date.parse(b.published_at) - Date.parse(a.published_at),
      ),
    [news],
  );

  const featuredVideo = useMemo(
    () => sorted.find((n) => embedUrl(n.url)) ?? null,
    [sorted],
  );
  const featured = featuredVideo ?? sorted[0] ?? null;
  const rest = sorted.filter((n) => n.id !== featured?.id);
  const player = featured ? embedUrl(featured.url) : null;

  const sources = useMemo(
    () => new Set(sorted.map((n) => n.source)).size,
    [sorted],
  );

  if (!loaded) return <PageSkeleton cards={6} />;

  return (
    <article className="about news-page">
      <header className="about__hero reveal">
        <div>
          <p className="t-caps muted">News</p>
          <h1 className="t-display-lg about__title">
            Signals, kept apart from the counts
          </h1>
          <p className="about__lede">
            Reporting that mentions hantavirus, plus formal notifications from WHO. Nothing here
            changes a case number; it arrives before agencies publish, and often
            turns out to be about something else.
          </p>
        </div>
        <aside className="about__facts">
          <div className="about__fact">
            <span className="about__fact-value yellow">{sorted.length}</span>
            <span className="about__fact-label">Items</span>
          </div>
          <div className="about__fact">
            <span className="about__fact-value">{sources}</span>
            <span className="about__fact-label">Outlets</span>
          </div>
        </aside>
      </header>

      {error && (
        <p className="muted small" style={{ marginTop: "var(--s-lg)" }}>
          The news feed could not be loaded.
        </p>
      )}

      {featured && (
        <section className="about__block reveal">
          <p className="t-caps muted">{player ? "Latest video" : "Latest"}</p>
          <h2 className="t-display-sm">{featured.title}</h2>
          <p className="about__note">
            {featured.source}, {relativeTime(featured.published_at)}
          </p>
          {player ? (
            <div className="news-video">
              <iframe
                src={player}
                title={featured.title}
                allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          ) : (
            <p className="about__note muted small">
              No video in the current feed. The newest report is linked below.
            </p>
          )}
          <a
            className="btn btn--secondary"
            href={featured.url}
            target="_blank"
            rel="noreferrer noopener"
          >
            Read the report →
          </a>
        </section>
      )}

      <section className="about__block reveal">
        <p className="t-caps muted">Feed</p>
        <h2 className="t-display-sm">Everything else</h2>
        <div className="news-grid">
          {rest.map((n) => (
            <a
              className="news-card"
              key={n.id}
              href={n.url}
              target="_blank"
              rel="noreferrer noopener"
            >
              <div className="news-card__meta">
                <span className="news-card__source">{n.source}</span>
                <span>{relativeTime(n.published_at)}</span>
              </div>
              <h3>{n.title}</h3>
            </a>
          ))}
        </div>
        {!error && sorted.length === 0 && (
          <p className="muted small">Nothing in the feed right now.</p>
        )}
      </section>
    </article>
  );
}
