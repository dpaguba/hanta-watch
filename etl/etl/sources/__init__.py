"""ETL data sources.

Each module exports a single function: fetch() -> dict.

The returned dict has the shape::

    {
        "outbreaks":   [...],
        "countries":   [...],
        "timeline":    [...],
        "news":        [...],
    }

Any key may be omitted. The orchestrator (run.py) merges results
from all sources, so individual modules stay focused.

A module returns a dict of records, or an empty dict when the source had
nothing. Transport failures propagate as `FetchError` so the run records them
as an error rather than as an empty result.
"""
