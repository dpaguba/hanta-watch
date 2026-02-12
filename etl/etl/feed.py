"""RSS feed of outbreak updates and news items.

Every item keeps its own publication date. Stamping the build time on all of
them, which this did until August 2026, re-dated a year-old bulletin as today's
news on every hourly run and made the feed useless to anyone sorting by date.
"""

from __future__ import annotations

from datetime import datetime, timezone
from email.utils import format_datetime
from html import escape
from typing import Any


def _rfc822(value: str | None, fallback: datetime) -> str:
    """RFC 822 date for RSS, falling back when the source date is unusable."""
    if value:
        try:
            parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
            if parsed.tzinfo is None:
                parsed = parsed.replace(tzinfo=timezone.utc)
            return format_datetime(parsed)
        except ValueError:
            pass
    return format_datetime(fallback)


FEED_HOME = "https://github.com/dpaguba/hanta-watch"


def _latest_event(outbreak: dict[str, Any]) -> str | None:
    """Date of the most recent entry in an outbreak's timeline."""
    dates = [e.get("date") for e in outbreak.get("timeline", []) if e.get("date")]
    return max(dates) if dates else outbreak.get("started")


def build_feed(outbreaks: list[dict[str, Any]], news_items: list[dict[str, Any]]) -> str:
    built_at = datetime.now(timezone.utc)
    now = format_datetime(built_at)
    items_xml: list[str] = []

    for ob in outbreaks[:10]:
        title = f"Outbreak update: {ob['name']}"
        link = ob["sources"][0]["url"] if ob.get("sources") else FEED_HOME
        desc = (
            f"{ob.get('summary', '')} "
            f"Cases: {ob.get('cases_confirmed', 0)} confirmed, "
            f"{ob.get('cases_probable', 0)} probable. "
            f"Deaths: {ob.get('deaths', 0)}."
        )
        items_xml.append(
            "<item>"
            f"<title>{escape(title)}</title>"
            f"<link>{escape(link)}</link>"
            f"<description>{escape(desc)}</description>"
            f'<guid isPermaLink="false">outbreak:{escape(ob["id"])}</guid>'
            f"<pubDate>{_rfc822(_latest_event(ob), built_at)}</pubDate>"
            "</item>"
        )

    for n in news_items[:20]:
        items_xml.append(
            "<item>"
            f"<title>{escape(n['title'])}</title>"
            f"<link>{escape(n['url'])}</link>"
            f"<description>{escape(n['source'])}</description>"
            f'<guid isPermaLink="false">news:{escape(n["id"])}</guid>'
            f"<pubDate>{_rfc822(n.get('published_at'), built_at)}</pubDate>"
            "</item>"
        )

    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<rss version="2.0">\n'
        "<channel>\n"
        "<title>Hanta-Watch: significant changes</title>\n"
        f"<link>{FEED_HOME}</link>\n"
        "<description>Hourly aggregated hantavirus surveillance signals.</description>\n"
        f"<lastBuildDate>{now}</lastBuildDate>\n" + "\n".join(items_xml) + "\n</channel>\n</rss>\n"
    )
