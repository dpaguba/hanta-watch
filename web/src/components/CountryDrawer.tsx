import type { CountryRecord } from "../data/types";
import { formatNumber } from "../lib/format";
import ProvenanceBadge from "./ProvenanceBadge";

interface Props {
  country: CountryRecord | null;
  /** Name of a hovered country that has no record of its own. */
  fallbackName?: string | null;
  /** Outbreaks this country takes part in, whether or not it has a record. */
  outbreakNames?: string[];
}

export default function CountryDrawer({
  country,
  fallbackName,
  outbreakNames = [],
}: Props) {
  if (!country)
    return (
      <div className="country-drawer country-drawer--empty">
        <p className="country-drawer__name">{fallbackName ?? "No country selected"}</p>
        <p className="muted small">
          {!fallbackName
            ? "Hover a country on the map to preview it, click to open its page."
            : outbreakNames.length > 0
              ? `Part of ${outbreakNames.join(", ")}. No cumulative country record of its own, which is why the map marks it without shading it.`
              : "No hantavirus records for this country."}
        </p>
      </div>
    );

  return (
    <div className="country-drawer">
      <div className="country-drawer__head">
        <div>
          <h3 className="country-drawer__title">{country.country}</h3>
          <span className="country-drawer__iso t-mono">{country.iso3}</span>
        </div>
      </div>

      <div className="country-drawer__figures">
        <div className="country-drawer__figure">
          <span className="country-drawer__value yellow">
            {formatNumber(country.cumulative_cases)}
          </span>
          <span className="country-drawer__label">
            Cumulative cases{country.estimate ? " (est.)" : ""}
          </span>
        </div>
        <div className="country-drawer__figure">
          <span className="country-drawer__value rose">
            {formatNumber(country.cumulative_deaths)}
          </span>
          <span className="country-drawer__label">Cumulative deaths</span>
        </div>
      </div>

      <dl className="country-drawer__rows">
        {country.year_range && (
          <div className="country-drawer__row">
            <dt>Years covered</dt>
            <dd>
              {country.year_range[0]}–{country.year_range[1]}
            </dd>
          </div>
        )}
        {country.last_case_reported && (
          <div className="country-drawer__row">
            <dt>Last case</dt>
            <dd>{country.last_case_reported}</dd>
          </div>
        )}
        <div className="country-drawer__row">
          <dt>Syndrome</dt>
          <dd>{country.syndrome}</dd>
        </div>
      </dl>

      {country.virus_species.length > 0 && (
        <div className="country-drawer__species">
          {country.virus_species.map((v) => (
            <span key={v} className="country-drawer__chip">
              {v}
            </span>
          ))}
        </div>
      )}

      <div className="country-drawer__foot">
        <ProvenanceBadge sources={country.sources} />
        <span className="muted small">Click the country to open its page</span>
      </div>
    </div>
  );
}
