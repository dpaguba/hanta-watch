import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { TimelinePoint } from "../data/types";

interface Props {
  points: TimelinePoint[];
  iso3?: string;
}

export default function Timeline({ points, iso3 }: Props) {
  const filtered = iso3 ? points.filter((p) => p.iso3 === iso3) : points;
  const byPeriod = new Map<string, number>();
  for (const p of filtered) {
    byPeriod.set(p.period, (byPeriod.get(p.period) ?? 0) + p.cases);
  }
  const series = [...byPeriod.entries()]
    .map(([period, cases]) => ({ period, cases }))
    .sort((a, b) => (a.period > b.period ? 1 : -1));

  if (series.length === 0)
    return <p className="muted small">No time-series data.</p>;

  return (
    <div style={{ width: "100%", height: 240 }}>
      <ResponsiveContainer>
        <LineChart data={series} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
          <CartesianGrid stroke="var(--hairline)" strokeDasharray="3 4" />
          <XAxis
            dataKey="period"
            stroke="var(--muted)"
            tick={{ fontSize: 11, fontFamily: "Inter, sans-serif" }}
            tickLine={false}
            axisLine={{ stroke: "var(--hairline)" }}
          />
          <YAxis
            stroke="var(--muted)"
            tick={{ fontSize: 11, fontFamily: "Inter, sans-serif" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ stroke: "var(--hairline-strong)", strokeDasharray: "3 3" }}
            contentStyle={{
              background: "var(--surface-card)",
              border: "1px solid var(--hairline)",
              borderRadius: 8,
              color: "var(--on-dark)",
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
            }}
            labelStyle={{ color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 11 }}
          />
          <Line
            type="monotone"
            dataKey="cases"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "var(--primary)", stroke: "var(--canvas)", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
