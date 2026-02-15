import type {
  CountryRecord,
  Meta,
  NewsItem,
  Outbreak,
  Reservoir,
  TimelinePoint,
  VirusSpecies,
} from "./types";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function fetchJson<T>(path: string): Promise<T> {
  const url = `${BASE}/data/${path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url} (${res.status})`);
  return res.json() as Promise<T>;
}

export const loadMeta = () => fetchJson<Meta>("meta.json");
export const loadOutbreaks = () => fetchJson<Outbreak[]>("outbreaks.json");
export const loadCountries = () => fetchJson<CountryRecord[]>("cases_by_country.json");
export const loadTimeline = () => fetchJson<TimelinePoint[]>("cases_timeline.json");
export const loadNews = () => fetchJson<NewsItem[]>("news.json");

export const loadVirusSpecies = () =>
  fetchJson<{ species: VirusSpecies[] }>("virus_species.json").then((d) => d.species);

export const loadReservoirs = () =>
  fetchJson<{ reservoirs: Reservoir[] }>("reservoirs.json").then((d) => d.reservoirs);

export interface CountryCentroid {
  name: string;
  lat: number;
  lon: number;
}

export const loadCountryCentroids = () =>
  fetchJson<{ countries: Record<string, CountryCentroid> }>("countries.json").then(
    (d) => d.countries,
  );
