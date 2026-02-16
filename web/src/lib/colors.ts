/**
 * Map choropleth ramp, from a dim floor up to the brand yellow.
 *
 * Log scale, so an outlier like China's HFRS total does not flatten everything
 * else. The floor starts clearly above the "no data" grey: it used to start at
 * the same value, so the Netherlands, at the centre of the outbreak the site
 * leads with, rendered as if it had no data at all.
 */
export function casesToColor(cases: number, max: number): string {
  if (cases <= 0) return "#161616"; // --map-base
  const t = Math.min(1, Math.log10(cases + 1) / Math.log10(max + 1));

  // Stops, in RGB.
  const stops: [number, [number, number, number]][] = [
    [0.0, [0x3a, 0x38, 0x2a]], // clearly above the no-data grey
    [0.35, [0x5c, 0x55, 0x22]],
    [0.7, [0x9a, 0x8d, 0x28]],
    [1.0, [0xfa, 0xff, 0x69]], // primary yellow
  ];

  // Find segment.
  let lo = stops[0];
  let hi = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i][0] && t <= stops[i + 1][0]) {
      lo = stops[i];
      hi = stops[i + 1];
      break;
    }
  }
  const range = hi[0] - lo[0];
  const f = range === 0 ? 0 : (t - lo[0]) / range;
  const r = Math.round(lo[1][0] + (hi[1][0] - lo[1][0]) * f);
  const g = Math.round(lo[1][1] + (hi[1][1] - lo[1][1]) * f);
  const b = Math.round(lo[1][2] + (hi[1][2] - lo[1][2]) * f);
  return `rgb(${r}, ${g}, ${b})`;
}
