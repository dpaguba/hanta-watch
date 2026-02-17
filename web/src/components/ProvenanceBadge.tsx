import type { Source } from "../data/types";

interface Props {
  sources: Source[];
  label?: string;
}

export default function ProvenanceBadge({ sources, label }: Props) {
  if (sources.length === 0) return null;
  const primary = sources[0];
  const title = sources.map((s) => `${s.name}: ${s.url}`).join("\n");
  return (
    <a
      className="provenance"
      href={primary.url}
      target="_blank"
      rel="noreferrer noopener"
      title={title}
      aria-label={`Source: ${primary.name}`}
    >
      {label ?? primary.name}
    </a>
  );
}
