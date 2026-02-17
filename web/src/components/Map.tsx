import type React from "react";
import { useEffect, useRef, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";

import {
  loadCountryCentroids,
  type CountryCentroid,
} from "../data/loaders";
import type { CountryRecord, Outbreak } from "../data/types";
import { casesToColor } from "../lib/colors";
import { numericToIso3 } from "../lib/iso";

/** Natural Earth 110m borders, served from this site rather than a CDN.
 *
 * The published world-atlas build draws Crimea as part of Russia. The copy in
 * `public/` moves that polygon to Ukraine, which is the only change to it.
 */
const TOPO_URL = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/countries-110m.json`;

interface Props {
  countries: CountryRecord[];
  outbreaks?: Outbreak[];
  onSelectCountry?: (iso3: string) => void;
  /** Fires on every country the pointer crosses, with or without a record. */
  onHoverCountry?: (hover: { name: string; iso3: string | null } | null) => void;
}

export default function WorldMap({
  countries,
  outbreaks = [],
  onSelectCountry,
  onHoverCountry,
}: Props) {
  const [centroids, setCentroids] = useState<Record<string, CountryCentroid>>({});
  const [tip, setTip] = useState<{ x: number; y: number; label: string } | null>(null);
  const clearTimer = useRef(0);

  const cancelClear = () => window.clearTimeout(clearTimer.current);
  const scheduleClear = () => {
    window.clearTimeout(clearTimer.current);
    clearTimer.current = window.setTimeout(() => {
      setTip(null);
      onHoverCountry?.(null);
    }, 60);
  };
  useEffect(() => () => window.clearTimeout(clearTimer.current), []);
  useEffect(() => {
    loadCountryCentroids().then(setCentroids).catch(() => setCentroids({}));
  }, []);

  const byIso3 = new Map(countries.map((c) => [c.iso3, c]));
  const byName = new Map(countries.map((c) => [c.country.toLowerCase(), c]));
  const maxCases = countries.reduce((m, c) => Math.max(m, c.cumulative_cases), 1);

  // Build outbreak markers from active outbreaks' countries.
  const markers: { iso3: string; lat: number; lon: number; outbreakId: string }[] = [];
  for (const ob of outbreaks) {
    if (ob.status === "closed") continue;
    for (const iso3 of ob.countries) {
      const c = centroids[iso3];
      if (!c) continue;
      markers.push({ iso3, lat: c.lat, lon: c.lon, outbreakId: ob.id });
    }
  }

  return (
    <div
      className="map-wrap"
      onMouseLeave={() => scheduleClear()}
    >
      {tip && (
        <div className="map-tip" style={{ left: tip.x, top: tip.y }} aria-hidden="true">
          {tip.label}
        </div>
      )}
      <ComposableMap
        projectionConfig={{ scale: 145 }}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={TOPO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const name = (geo.properties as { name?: string }).name ?? "";
              const rec = byIso3.get(numericToIso3(geo.id)) ?? byName.get(name.toLowerCase());
              const color = rec
                ? casesToColor(rec.cumulative_cases, maxCases)
                : "var(--map-base)";
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => rec && onSelectCountry?.(rec.iso3)}
                  tabIndex={rec ? 0 : undefined}
                  role={rec ? "button" : undefined}
                  onFocus={() => onHoverCountry?.({ name, iso3: rec?.iso3 ?? null })}
                  onBlur={() => onHoverCountry?.(null)}
                  onKeyDown={(event: React.KeyboardEvent<SVGPathElement>) => {
                    if (event.key !== "Enter" && event.key !== " ") return;
                    event.preventDefault();
                    if (rec) onSelectCountry?.(rec.iso3);
                  }}
                  onMouseEnter={() => {
                    cancelClear();
                    onHoverCountry?.({ name, iso3: rec?.iso3 ?? null });
                  }}
                  onMouseLeave={() => scheduleClear()}
                  onMouseMove={(event: React.MouseEvent<SVGPathElement>) => {
                    const box = event.currentTarget.ownerSVGElement?.parentElement?.getBoundingClientRect();
                    if (!box) return;
                    setTip({
                      x: event.clientX - box.left,
                      y: event.clientY - box.top,
                      label: name,
                    });
                  }}
                  style={{
                    default: {
                      fill: color,
                      stroke: "var(--hairline)",
                      strokeWidth: 0.4,
                    },
                    hover: {
                      fill: "#ffffff",
                      stroke: "var(--hairline-strong)",
                      strokeWidth: 0.6,
                      cursor: rec ? "pointer" : "default",
                    },
                    pressed: { fill: "var(--primary-active)" },
                  }}
                  aria-label={
                    rec
                      ? `${rec.country}: ${rec.cumulative_cases} cumulative cases${rec.estimate ? ", estimated" : ""}`
                      : name
                  }
                />
              );
            })
          }
        </Geographies>

        {markers.map((m, i) => (
          <Marker
            key={`${m.outbreakId}-${m.iso3}-${i}`}
            coordinates={[m.lon, m.lat]}
            className="map-pulse"
          >
            <circle
              className="map-pulse-ring"
              r={3}
              fill="none"
              stroke="var(--primary)"
              strokeWidth={1.5}
            />
            <circle r={3.2} fill="var(--primary)" stroke="var(--canvas)" strokeWidth={0.6} />
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
}
