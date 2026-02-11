"""WHO Disease Outbreak News (DON).

Public OData endpoint: https://www.who.int/api/news/diseaseoutbreaknews

The API returns oldest first and pages fifty at a time, so an unsorted request
answers with 2006 to 2014 and a `@odata.nextLink` that has to be followed to
reach anything recent. Sorting by publication date descending is one parameter
and skips all of that. The endpoint rejects `$top` above 100, so 100 is the
page size: roughly the last eight months of every disease WHO reports on.

An item matches on its title, or on a body that mentions hantavirus repeatedly.
A single body mention is usually a differential-diagnosis list in a bulletin
about some other disease. WHO publishes a hantavirus notification a few times a
year, so an empty result is the normal case rather than a failure.
"""

from __future__ import annotations

import logging
import re
from datetime import datetime, timezone
from typing import Any

from ..dedupe import news_id
from ._http import get

log = logging.getLogger(__name__)

WHO_DON_API = (
    "https://www.who.int/api/news/diseaseoutbreaknews?$orderby=PublicationDate desc&$top=100"
)

WHO_DON_ITEM_PREFIX = "https://www.who.int/emergencies/disease-outbreak-news/item"

# The title decides. A body mention is accepted only when the document is about
# hantavirus rather than listing it among differential diagnoses, which is how a
# WHO yellow fever bulletin once entered this feed.
_TITLE_RE = re.compile(
    r"hantavir|andes virus|puumala|hantaan|seoul virus|dobrava|sin nombre|"
    r"h(?:aemorrhagic|emorrhagic) fever with renal syndrome|pulmonary syndrome",
    re.I,
)
_BODY_RE = re.compile(r"hantavir", re.I)
_BODY_MIN_MENTIONS = 3

_TAGS = re.compile(r"<[^>]+>")


def _text(item: dict[str, Any], *fields: str) -> str:
    """Concatenate the named HTML fields as plain text."""
    parts = [str(item.get(f) or "") for f in fields]
    return _TAGS.sub(" ", " ".join(parts))


def fetch() -> dict[str, Any]:
    r = get(WHO_DON_API)
    try:
        data = r.json()
    except Exception as e:  # noqa: BLE001
        log.warning("WHO DON JSON parse failed: %s", e)
        return {}

    items = data.get("value") if isinstance(data, dict) else data
    if not isinstance(items, list):
        return {}

    news: list[dict[str, Any]] = []
    for it in items:
        title = str(it.get("Title") or it.get("OverrideTitle") or "").strip()
        body = _text(it, "Overview", "Summary", "Epidemiology", "Assessment")
        if not _TITLE_RE.search(title) and len(_BODY_RE.findall(body)) < _BODY_MIN_MENTIONS:
            continue

        slug = str(it.get("ItemDefaultUrl") or "").strip().lstrip("/")
        if not slug:
            continue
        url = f"{WHO_DON_ITEM_PREFIX}/{slug}"

        published = it.get("PublicationDate") or it.get("PublicationDateAndTime")
        try:
            published_at = datetime.fromisoformat(str(published).replace("Z", "+00:00"))
        except Exception:  # noqa: BLE001
            published_at = datetime.now(timezone.utc)

        news.append(
            {
                "id": news_id(title, url),
                "title": title,
                "url": url,
                "source": "WHO DON",
                "published_at": published_at.isoformat(),
                "tags": ["WHO", "official"],
                "country_iso3": [],
            }
        )

    log.info("WHO DON: %d of %d items mention hantavirus", len(news), len(items))
    return {"news": news}
