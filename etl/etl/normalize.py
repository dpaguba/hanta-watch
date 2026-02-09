"""Normalizers: country names → ISO3, virus aliases → canonical species id."""

from __future__ import annotations

import re

# A trimmed name → ISO3 table covering hantavirus-relevant countries.
# For everything else, fall through and accept whatever the upstream gave us.
_COUNTRY_TO_ISO3: dict[str, str] = {
    "united states": "USA",
    "united states of america": "USA",
    "u.s.": "USA",
    "us": "USA",
    "usa": "USA",
    "america": "USA",
    "canada": "CAN",
    "mexico": "MEX",
    "argentina": "ARG",
    "chile": "CHL",
    "bolivia": "BOL",
    "paraguay": "PRY",
    "uruguay": "URY",
    "brazil": "BRA",
    "panama": "PAN",
    "costa rica": "CRI",
    "finland": "FIN",
    "sweden": "SWE",
    "norway": "NOR",
    "germany": "DEU",
    "france": "FRA",
    "spain": "ESP",
    "belgium": "BEL",
    "netherlands": "NLD",
    "the netherlands": "NLD",
    "holland": "NLD",
    "united kingdom": "GBR",
    "uk": "GBR",
    "great britain": "GBR",
    "poland": "POL",
    "czechia": "CZE",
    "czech republic": "CZE",
    "estonia": "EST",
    "slovenia": "SVN",
    "croatia": "HRV",
    "serbia": "SRB",
    "bosnia and herzegovina": "BIH",
    "russia": "RUS",
    "russian federation": "RUS",
    "georgia": "GEO",
    "china": "CHN",
    "south korea": "KOR",
    "korea, republic of": "KOR",
    "republic of korea": "KOR",
}

# Virus aliases → canonical species id (matches data/reference/virus_species.json)
_VIRUS_ALIASES: dict[str, str] = {
    "andes virus": "ANDV",
    "andes": "ANDV",
    "andv": "ANDV",
    "sin nombre virus": "SNV",
    "sin nombre": "SNV",
    "snv": "SNV",
    "bayou": "BAYV",
    "bayou virus": "BAYV",
    "black creek canal": "BCCV",
    "black creek canal virus": "BCCV",
    "choclo": "CHOV",
    "laguna negra": "LANV",
    "hantaan": "HTNV",
    "hantaan virus": "HTNV",
    "htnv": "HTNV",
    "seoul": "SEOV",
    "seoul virus": "SEOV",
    "puumala": "PUUV",
    "puumala virus": "PUUV",
    "puuv": "PUUV",
    "dobrava": "DOBV",
    "dobrava-belgrade": "DOBV",
    "saaremaa": "SAAV",
    "tula": "TULV",
}


def normalize_country(name: str) -> str | None:
    """Best-effort country name → ISO3.

    Returns None if we can't recognise the input; callers should
    decide whether to drop the record or leave it unmapped.
    """
    if not name:
        return None
    key = re.sub(r"\s+", " ", name.strip().lower())
    return _COUNTRY_TO_ISO3.get(key)


def normalize_virus(name: str) -> str | None:
    if not name:
        return None
    key = re.sub(r"\s+", " ", name.strip().lower())
    return _VIRUS_ALIASES.get(key)


def normalize_title(title: str) -> str:
    """Lowercase, collapse whitespace, drop punctuation, used for dedup."""
    t = title.lower()
    t = re.sub(r"[^a-z0-9]+", " ", t)
    return re.sub(r"\s+", " ", t).strip()
