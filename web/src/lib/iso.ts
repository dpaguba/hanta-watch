/** Numeric ISO 3166-1 codes carried by the topology, mapped to alpha-3.
 *
 * The topology identifies countries by numeric code and by an English display
 * name. Names drift ("United States" against "United States of America"), so
 * the numeric code is the stable key. Only the countries this dataset covers
 * need to be here; anything else falls back to a name match.
 */
const NUMERIC_TO_ISO3: Record<string, string> = {
  "032": "ARG",
  "076": "BRA",
  "124": "CAN",
  "152": "CHL",
  "156": "CHN",
  "246": "FIN",
  "250": "FRA",
  "276": "DEU",
  "410": "KOR",
  "591": "PAN",
  "528": "NLD",
  "643": "RUS",
  "724": "ESP",
  "752": "SWE",
  "804": "UKR",
  "826": "GBR",
  "840": "USA",
};

export function numericToIso3(id: unknown): string {
  if (typeof id !== "string" && typeof id !== "number") return "";
  return NUMERIC_TO_ISO3[String(id).padStart(3, "0")] ?? "";
}
