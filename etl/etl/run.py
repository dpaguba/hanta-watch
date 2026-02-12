"""Orchestrator: runs every source, merges results, writes JSON.

Run with:

    python -m etl.run --out web/public/data

Behaviour:
- Each source is wrapped in try/except. A failure is recorded in
  meta.json.source_runs[<name>] but does not block the run.
- Seed data is always merged in *first*, so a totally offline run
  still produces a coherent dataset (Day-Zero behaviour).
- Upstream sources can only ADD news/outbreak source links; they do
  NOT silently overwrite hardcoded confirmed case counts from seed.
  This is conservative: when in doubt, trust the seed (which itself
  came from primary publishers).
"""

from __future__ import annotations

import argparse
import csv
import json
import logging
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from . import seed
from .dedupe import dedupe_news
from .feed import build_feed
from .schema import SCHEMA_VERSION, CountryRecord, Meta, NewsItem, Outbreak, TimelinePoint
from .sources import ecdc, google_news, who_don

log = logging.getLogger("etl")

SOURCES = {
    "who_don": who_don.fetch,
    "ecdc": ecdc.fetch,
    "google_news": google_news.fetch,
}


def _run_source(name: str, fn) -> tuple[dict[str, Any], dict[str, Any]]:
    """Run one source and describe what actually came back.

    Three states, because two were not enough. ``error`` means the endpoint
    could not be read. ``empty`` means it answered and had nothing to say,
    which is the normal state for WHO between outbreaks. ``ok`` means records
    arrived. Reporting a quiet week as a failure is as misleading as reporting
    a blocked endpoint as a success.
    """
    started = datetime.now(timezone.utc)
    try:
        payload = fn() or {}
        items = sum(len(v) for v in payload.values() if isinstance(v, list))
        return payload, {
            "ok": True,
            "state": "ok" if items else "empty",
            "fetched_at": started.isoformat(),
            "items": items,
            "error": None,
        }
    except Exception as e:  # noqa: BLE001
        log.exception("source %s failed", name)
        return {}, {
            "ok": False,
            "state": "error",
            "fetched_at": started.isoformat(),
            "items": 0,
            "error": f"{type(e).__name__}: {e}",
        }


def _validate(records: list[dict[str, Any]], model: Any, label: str) -> None:
    """Check what we are about to publish against the schema.

    The models existed for a year without anything calling them, so the schema
    documented an intention rather than the output. A failure here is a bug in
    the pipeline and should stop the run rather than ship a malformed dataset.
    """
    for record in records:
        model.model_validate(record)
    log.debug("%s: %d records validated", label, len(records))


def _write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(data, indent=2, ensure_ascii=False, default=str) + "\n", encoding="utf-8"
    )


def _write_csv(path: Path, header: list[str], rows: list[list[Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(header)
        for row in rows:
            w.writerow(row)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--out",
        type=Path,
        default=Path(__file__).resolve().parents[2] / "web" / "public" / "data",
        help="Output directory for JSON files (default: web/public/data).",
    )
    parser.add_argument(
        "--snapshots",
        type=Path,
        default=Path(__file__).resolve().parents[2] / "data" / "snapshots",
        help="Directory for the CSV archive (default: data/snapshots).",
    )
    parser.add_argument(
        "--offline",
        action="store_true",
        help="Skip upstream sources; only emit seed data.",
    )
    parser.add_argument(
        "-v",
        "--verbose",
        action="count",
        default=0,
    )
    args = parser.parse_args(argv)

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )

    out_dir: Path = args.out
    out_dir.mkdir(parents=True, exist_ok=True)

    # Start with seed.
    outbreaks: list[dict[str, Any]] = [dict(o) for o in seed.outbreaks()]
    countries: list[dict[str, Any]] = [dict(c) for c in seed.countries()]
    timeline_points: list[dict[str, Any]] = [dict(t) for t in seed.timeline()]
    news_items: list[dict[str, Any]] = [dict(n) for n in seed.news()]
    # Ensure news items have stable ids.
    from .dedupe import news_id

    for n in news_items:
        n.setdefault("id", news_id(n["title"], n["url"]))

    source_runs: dict[str, dict[str, Any]] = {}

    if not args.offline:
        for name, fn in SOURCES.items():
            payload, run_meta = _run_source(name, fn)
            source_runs[name] = run_meta
            news_items.extend(payload.get("news", []))
            # Conservative merge: only fill missing countries / timeline,
            # never overwrite a value already present from seed.
            existing_iso3 = {c["iso3"] for c in countries}
            for c in payload.get("countries", []):
                if c["iso3"] not in existing_iso3:
                    countries.append(c)
                    existing_iso3.add(c["iso3"])
            existing_periods = {(t["iso3"], t["period"]) for t in timeline_points}
            for t in payload.get("timeline", []):
                if (t["iso3"], t["period"]) not in existing_periods:
                    timeline_points.append(t)
                    existing_periods.add((t["iso3"], t["period"]))
            for link in payload.get("outbreak_sources", []):
                target = next((o for o in outbreaks if o["id"] == link["outbreak_id"]), None)
                if target is None:
                    continue
                if not any(s["url"] == link["url"] for s in target["sources"]):
                    target["sources"].append(
                        {
                            "name": link["name"],
                            "url": link["url"],
                            "fetched_at": link["fetched_at"],
                        }
                    )
    else:
        log.info("--offline: skipping upstream sources")

    news_items = dedupe_news(news_items)
    # Sort news newest first.
    news_items.sort(key=lambda n: n["published_at"], reverse=True)
    news_items = news_items[:200]

    generated_at = datetime.now(timezone.utc)

    meta = {
        "schema_version": SCHEMA_VERSION,
        "generated_at": generated_at.isoformat(),
        "source_runs": source_runs,
        "counts": {
            "outbreaks": len(outbreaks),
            "countries": len(countries),
            "timeline_points": len(timeline_points),
            "news": len(news_items),
        },
    }

    _validate(outbreaks, Outbreak, "outbreaks")
    _validate(countries, CountryRecord, "countries")
    _validate(timeline_points, TimelinePoint, "timeline")
    _validate(news_items, NewsItem, "news")
    Meta.model_validate(meta)

    _write_json(out_dir / "meta.json", meta)
    _write_json(out_dir / "outbreaks.json", outbreaks)
    _write_json(out_dir / "cases_by_country.json", countries)
    _write_json(out_dir / "cases_timeline.json", timeline_points)
    _write_json(out_dir / "news.json", news_items)

    # Reference data, copied from data/reference/ if present.
    ref_dir = Path(__file__).resolve().parents[2] / "data" / "reference"
    if ref_dir.exists():
        for ref_file in ref_dir.glob("*.json"):
            (out_dir / ref_file.name).write_text(
                ref_file.read_text(encoding="utf-8"), encoding="utf-8"
            )

    # RSS feed.
    (out_dir / "feed.xml").write_text(build_feed(outbreaks, news_items), encoding="utf-8")

    # CSV snapshots for long-term archival, also feeds the "what changed" view via git diff.
    # Its own flag, so a run against a temporary output directory does not write
    # into the repository. It used to, which meant the test suite dirtied the
    # working tree every time it ran.
    snap_dir: Path = args.snapshots
    snap_dir.mkdir(parents=True, exist_ok=True)
    today = generated_at.strftime("%Y-%m-%d")
    _write_csv(
        snap_dir / f"countries_{today}.csv",
        ["iso3", "country", "syndrome", "cumulative_cases", "cumulative_deaths"],
        [
            [c["iso3"], c["country"], c["syndrome"], c["cumulative_cases"], c["cumulative_deaths"]]
            for c in countries
        ],
    )
    _write_csv(
        snap_dir / f"outbreaks_{today}.csv",
        ["id", "name", "virus_species", "cases_confirmed", "cases_probable", "deaths"],
        [
            [
                o["id"],
                o["name"],
                o["virus_species"],
                o["cases_confirmed"],
                o["cases_probable"],
                o["deaths"],
            ]
            for o in outbreaks
        ],
    )

    log.info(
        "Wrote %d files to %s (outbreaks=%d, countries=%d, timeline=%d, news=%d)",
        5,
        out_dir,
        len(outbreaks),
        len(countries),
        len(timeline_points),
        len(news_items),
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
