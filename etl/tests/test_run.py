"""Smoke test: --offline run produces valid JSON files."""

from __future__ import annotations

import json
from pathlib import Path

from etl.run import main


def test_offline_run_writes_files(tmp_path: Path) -> None:
    rc = main(["--offline", "--out", str(tmp_path), "--snapshots", str(tmp_path / "snapshots")])
    assert rc == 0

    expected = [
        "meta.json",
        "outbreaks.json",
        "cases_by_country.json",
        "cases_timeline.json",
        "news.json",
        "feed.xml",
    ]
    for fname in expected:
        p = tmp_path / fname
        assert p.exists(), fname

    meta = json.loads((tmp_path / "meta.json").read_text())
    assert meta["schema_version"] == "1"
    assert "generated_at" in meta

    outbreaks = json.loads((tmp_path / "outbreaks.json").read_text())
    assert any(o["id"] == "mv-hondius-2026" for o in outbreaks)
    h = next(o for o in outbreaks if o["id"] == "mv-hondius-2026")
    # Kept apart on purpose: the project never sums the two columns.
    assert h["cases_confirmed"] == 12
    assert h["cases_probable"] == 1
    assert h["deaths"] == 3

    countries = json.loads((tmp_path / "cases_by_country.json").read_text())
    iso3 = {c["iso3"] for c in countries}
    assert {"USA", "ARG", "CHL", "BRA"} <= iso3
