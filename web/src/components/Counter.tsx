import type { ReactNode } from "react";

interface Props {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  /** Visual emphasis. signal = full-yellow card, danger = red number, accent = yellow number. */
  tone?: "default" | "signal" | "danger" | "accent";
}

export default function Counter({ label, value, sub, tone = "default" }: Props) {
  const cls =
    tone === "signal"
      ? "kpi kpi--signal"
      : tone === "danger"
        ? "kpi kpi--danger"
        : tone === "accent"
          ? "kpi kpi--accent"
          : "kpi";
  return (
    <div className={cls}>
      <div className="kpi__label">{label}</div>
      <div className="kpi__value">{value}</div>
      {sub && <div className="kpi__sub">{sub}</div>}
    </div>
  );
}
