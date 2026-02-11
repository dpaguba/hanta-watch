"""ECDC, the Andes hantavirus outbreak page.

ECDC publishes updates as HTML with a layout that varies between items, so no
figures are extracted. What this does check is that the page still exists and
still describes the outbreak the site links it to. A 200 alone was not worth
much: a redirect to a generic topic page, or a soft 404, would have counted as
a healthy source.
"""

from __future__ import annotations

import logging
import re
from datetime import datetime, timezone
from typing import Any

from ._http import get

log = logging.getLogger(__name__)

ECDC_ANDV_URL = (
    "https://www.ecdc.europa.eu/en/infectious-disease-topics/hantavirus-infection/"
    "surveillance-and-updates/andes-hantavirus-outbreak"
)

_RELEVANT = re.compile(r"hantavir|andes", re.I)
_TAGS = re.compile(r"<[^>]+>")


def fetch() -> dict[str, Any]:
    r = get(ECDC_ANDV_URL)

    text = _TAGS.sub(" ", r.text)
    if not _RELEVANT.search(text):
        log.warning("ECDC page no longer mentions hantavirus; not recording it")
        return {}

    return {
        "outbreak_sources": [
            {
                "outbreak_id": "mv-hondius-2026",
                "name": "ECDC",
                "url": ECDC_ANDV_URL,
                "fetched_at": datetime.now(timezone.utc).isoformat(),
            }
        ]
    }
