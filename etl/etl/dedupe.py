"""Dedup helpers for news items.

Strategy: SHA-256 of `normalize_title(title) + "|" + url_host`.
This collapses near-identical wire-service re-runs while keeping
distinct headlines per publisher.
"""

from __future__ import annotations

import hashlib
from urllib.parse import urlparse

from .normalize import normalize_title


def news_id(title: str, url: str) -> str:
    host = (urlparse(url).hostname or "").lower()
    key = f"{normalize_title(title)}|{host}"
    return hashlib.sha256(key.encode("utf-8")).hexdigest()[:32]


def dedupe_news(items: list[dict]) -> list[dict]:
    seen: set[str] = set()
    out: list[dict] = []
    for it in items:
        nid = it.get("id") or news_id(it["title"], it["url"])
        if nid in seen:
            continue
        seen.add(nid)
        it["id"] = nid
        out.append(it)
    return out
