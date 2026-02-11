"""Google News RSS for the `hantavirus` query."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

import feedparser

from ..dedupe import news_id
from ._http import get

log = logging.getLogger(__name__)

GNEWS_URL = "https://news.google.com/rss/search?q=hantavirus&hl=en-US&gl=US&ceid=US:en"


def fetch() -> dict[str, Any]:
    r = get(GNEWS_URL)
    parsed = feedparser.parse(r.text)
    items: list[dict[str, Any]] = []
    for entry in parsed.entries[:50]:
        title = (entry.get("title") or "").strip()
        url = entry.get("link") or ""
        if not title or not url:
            continue
        try:
            pub = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
        except Exception:  # noqa: BLE001
            pub = datetime.now(timezone.utc)
        # Source is the publisher embedded in the title after " - "
        source = entry.get("source", {}).get("title") if entry.get("source") else None
        if not source and " - " in title:
            source = title.rsplit(" - ", 1)[-1]
        items.append(
            {
                "id": news_id(title, url),
                "title": title,
                "url": url,
                "source": source or "Google News",
                "published_at": pub.isoformat(),
                "tags": ["news"],
                "country_iso3": [],
            }
        )
    return {"news": items}
