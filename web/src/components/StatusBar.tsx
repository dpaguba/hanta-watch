import type { Meta } from "../data/types";
import { relativeTime } from "../lib/format";

interface Props {
  meta: Meta | null;
}

const STATE_LABEL: Record<string, string> = {
  ok: "records",
  empty: "nothing new",
  error: "failed",
};

/** Says when the pipeline last ran and what each source did.
 *
 * It deliberately does not claim the figures are current. The pipeline runs
 * hourly; most of the case counts are compiled figures that change when the
 * publishing agency changes them, which is rarely. Conflating "we checked" with
 * "this is new" is what the old "live" badge did.
 */
export default function StatusBar({ meta }: Props) {
  if (!meta)
    return (
      <div className="statusbar">
        <span>Last checked: n/a</span>
      </div>
    );

  const runs = Object.entries(meta.source_runs ?? {});
  const failed = runs.filter(([, r]) => r.state === "error");

  return (
    <div className="statusbar" role="status" aria-live="polite">
      <span className="statusbar__checked">
        Last checked {relativeTime(meta.generated_at)}
      </span>
      {runs.length > 0 && (
        <span className="statusbar__sources">
          {runs.map(([name, run]) => {
            const state = run.state ?? (run.ok ? "ok" : "error");
            return (
              <span key={name} className={`statusbar__source ${state}`}>
                <span className="statusbar__dot" aria-hidden="true" />
                {name} · {STATE_LABEL[state] ?? state}
              </span>
            );
          })}
        </span>
      )}
      {failed.length > 0 && (
        <span className="statusbar__error">
          {failed.length === 1
            ? `${failed[0][0]} could not be read`
            : `${failed.length} sources could not be read`}
        </span>
      )}
    </div>
  );
}
