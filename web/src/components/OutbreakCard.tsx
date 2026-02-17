import { Link } from "react-router-dom";

import type { Outbreak } from "../data/types";
import { formatNumber } from "../lib/format";

interface Props {
  outbreak: Outbreak;
}

export default function OutbreakCard({ outbreak }: Props) {
  const cls = `outbreak outbreak--${outbreak.status}`;
  return (
    <Link className={cls} to={`/outbreaks/${outbreak.id}`}>
      <div className="outbreak__title">{outbreak.name}</div>
      <div className="outbreak__meta">
        <span className="outbreak__tag">{outbreak.virus_species}</span>
        <span className="outbreak__tag">{outbreak.syndrome}</span>
        <span className="outbreak__tag">{outbreak.status}</span>
        {outbreak.human_to_human && (
          <span className="outbreak__tag outbreak__tag--h2h">H2H</span>
        )}
      </div>
      <div className="outbreak__numbers">
        <div className="outbreak__num">
          <span className="outbreak__num-val">{formatNumber(outbreak.cases_confirmed)}</span>
          <span className="outbreak__num-lbl">{"confirmed"}</span>
        </div>
        <div className="outbreak__num">
          <span className="outbreak__num-val">{formatNumber(outbreak.cases_probable)}</span>
          <span className="outbreak__num-lbl">{"probable"}</span>
        </div>
        <div className="outbreak__num">
          <span className="outbreak__num-val">{formatNumber(outbreak.deaths)}</span>
          <span className="outbreak__num-lbl">{"deaths"}</span>
        </div>
        <div className="outbreak__num">
          <span className="outbreak__num-val">{outbreak.countries.length}</span>
          <span className="outbreak__num-lbl">{"countries"}</span>
        </div>
      </div>
    </Link>
  );
}
