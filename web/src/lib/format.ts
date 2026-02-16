const nf = new Intl.NumberFormat("en-US");

export function formatNumber(n: number): string {
  return nf.format(n);
}

export function relativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  const diff = Math.round((now.getTime() - then.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function freshnessClass(iso: string, now: Date = new Date()): "ok" | "stale" | "err" {
  const ageH = (now.getTime() - new Date(iso).getTime()) / 3_600_000;
  if (ageH > 24) return "err";
  if (ageH > 4) return "stale";
  return "ok";
}
