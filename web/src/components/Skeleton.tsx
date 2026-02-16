interface BlockProps {
  /** CSS width, so a skeleton can mirror the shape of what it stands in for. */
  width?: string;
  height?: string;
  radius?: string;
}

/** One shimmering placeholder block. */
export function SkeletonBlock({ width = "100%", height = "1rem", radius }: BlockProps) {
  return (
    <span
      className="skeleton"
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}

/** The dashboard as it looks before its data arrives.
 *
 * The shapes match the real layout, so the page does not jump when the JSON
 * lands. On a slow connection this is what fills the several seconds that used
 * to be an empty screen.
 */
export function DashboardSkeleton() {
  return (
    <div className="dashboard" aria-hidden="true">
      <section className="col">
        <div className="panel panel--map">
          <header className="panel__head">
            <SkeletonBlock width="120px" height="14px" />
          </header>
          <div className="skeleton-chips">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonBlock key={i} width="62px" height="28px" radius="999px" />
            ))}
          </div>
          <SkeletonBlock height="420px" radius="0" />
        </div>
        <div className="panel" style={{ marginTop: "var(--s-md)" }}>
          <header className="panel__head">
            <SkeletonBlock width="180px" height="14px" />
          </header>
          <div className="panel__body">
            <SkeletonBlock height="220px" />
          </div>
        </div>
      </section>
      <aside className="col">
        <div className="panel">
          <header className="panel__head">
            <SkeletonBlock width="140px" height="14px" />
          </header>
          <div className="panel__body skeleton-stack">
            <SkeletonBlock height="18px" width="70%" />
            <SkeletonBlock height="14px" width="45%" />
            <SkeletonBlock height="64px" />
            <SkeletonBlock height="64px" />
          </div>
        </div>
      </aside>
    </div>
  );
}

/** Placeholder for the four headline figures. */
export function StatsSkeleton() {
  return (
    <div className="hero-stats" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <div className="hero-stat" key={i}>
          <SkeletonBlock width="72px" height="38px" />
          <SkeletonBlock width="110px" height="11px" />
        </div>
      ))}
    </div>
  );
}

/** Placeholder for a page built from the About layout. */
export function PageSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <div className="about" aria-hidden="true">
      <div className="about__hero">
        <div className="skeleton-stack">
          <SkeletonBlock width="90px" height="11px" />
          <SkeletonBlock width="70%" height="44px" />
          <SkeletonBlock width="55%" height="16px" />
        </div>
        <div className="about__facts">
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="about__fact" key={i}>
              <SkeletonBlock width="80px" height="30px" />
              <SkeletonBlock width="100px" height="11px" />
            </div>
          ))}
        </div>
      </div>
      <div className="about__block skeleton-stack">
        <SkeletonBlock width="80px" height="11px" />
        <SkeletonBlock width="40%" height="28px" />
        <div className="about__grid">
          {Array.from({ length: cards }).map((_, i) => (
            <SkeletonBlock key={i} height="140px" radius="var(--r-lg)" />
          ))}
        </div>
      </div>
    </div>
  );
}
