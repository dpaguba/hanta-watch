// JSON contract. See docs/api.md for the canonical definitions.

export type Syndrome = "HPS" | "HFRS" | "mixed";

export interface Source {
  name: string;
  url: string;
  fetched_at?: string;
}

export interface CountryRecord {
  iso3: string;
  country: string;
  virus_species: string[];
  syndrome: Syndrome;
  /** True when the figure is a compiled estimate rather than a reported count. */
  estimate?: boolean;
  cumulative_cases: number;
  cumulative_deaths: number;
  year_range: [number, number] | null;
  last_case_reported: string | null;
  sources: Source[];
}

export interface TimelinePoint {
  iso3: string;
  period: string;
  cases: number;
  deaths: number;
  syndrome: Syndrome;
  virus_species?: string;
  source: string;
}

export interface OutbreakTimelineEvent {
  date: string;
  event: string;
}

export interface Outbreak {
  id: string;
  name: string;
  started: string;
  status: "active" | "monitored" | "closed";
  virus_species: string;
  syndrome: Syndrome;
  countries: string[];
  cases_confirmed: number;
  cases_probable: number;
  deaths: number;
  human_to_human: boolean;
  summary: string;
  sources: Source[];
  timeline: OutbreakTimelineEvent[];
}

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  published_at: string;
  tags: string[];
  country_iso3: string[];
}

export interface SourceRun {
  /** "ok" records arrived, "empty" the source had nothing, "error" it could not be read. */
  state?: "ok" | "empty" | "error";
  ok: boolean;
  fetched_at: string;
  items: number;
  error?: string | null;
}

export interface Meta {
  schema_version: string;
  generated_at: string;
  source_runs: Record<string, SourceRun>;
  counts?: Record<string, number>;
}

export interface VirusSpecies {
  id: string;
  name: string;
  syndrome: Syndrome;
  case_fatality_pct: number | null;
  reservoir_ids: string[];
  regions: string[];
  human_to_human: boolean;
  notes?: string;
}

export interface Reservoir {
  id: string;
  common_name: string;
  scientific_name: string;
  carries: string[];
  range_countries: string[];
  range_notes?: string;
}
