"""Seed data, used both as Day-Zero content and as fallback when
upstream sources are unreachable.

Numbers reflect what was on the public record as of mid-May 2026.
This module is the only place the ETL hardcodes case counts.
"""

from __future__ import annotations

from typing import Any

SEED_COMPILED_AT = "2026-05-13T00:00:00+00:00"
"""When the seed figures were compiled by hand.

Every seed citation carries this date rather than the time of the run. The
numbers have not been re-checked since, and a `fetched_at` that moves every
hour would claim otherwise.
"""


def outbreaks() -> list[dict[str, Any]]:
    return [
        {
            "id": "mv-hondius-2026",
            "name": "MV Hondius Andes virus cluster",
            "started": "2026-04-01",
            "status": "closed",
            "virus_species": "ANDV",
            "syndrome": "HPS",
            "countries": ["NLD", "ARG", "ESP", "CAN", "DEU", "FRA", "GBR", "ZAF"],
            "cases_confirmed": 12,
            "cases_probable": 1,
            "deaths": 3,
            "human_to_human": True,
            "summary": (
                "Cluster on the Dutch cruise ship MV Hondius, which departed "
                "Ushuaia on 1 April 2026. WHO reported 13 cases in total, 12 "
                "confirmed and one probable, including three deaths, across eight "
                "countries. All contacts completed the 42 day follow-up period and "
                "WHO closed the event on 2 July 2026, stating that no further "
                "related transmission is expected."
            ),
            "estimate": False,
            "sources": [
                {
                    "name": "WHO DON 2026-DON611 (final)",
                    "url": "https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON611",
                    "fetched_at": "2026-07-02T00:00:00+00:00",
                },
                {
                    "name": "WHO DON 2026-DON600 (initial)",
                    "url": "https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON600",
                    "fetched_at": SEED_COMPILED_AT,
                },
                {
                    "name": "ECDC",
                    "url": (
                        "https://www.ecdc.europa.eu/en/infectious-disease-topics/"
                        "hantavirus-infection/surveillance-and-updates/"
                        "andes-hantavirus-outbreak"
                    ),
                    "fetched_at": SEED_COMPILED_AT,
                },
            ],
            "timeline": [
                {"date": "2026-04-01", "event": "MV Hondius departs Ushuaia, Argentina."},
                {"date": "2026-04-28", "event": "First fatal case identified onboard."},
                {
                    "date": "2026-05-06",
                    "event": "Vessel departs for Tenerife with medical resources.",
                },
                {"date": "2026-05-07", "event": "WHO publishes Disease Outbreak News."},
                {
                    "date": "2026-05-10",
                    "event": "Vessel arrives Tenerife; disembarkation begins; repatriation to NL, ES, DE, FR, GB, CA.",
                },
                {
                    "date": "2026-05-12",
                    "event": "11 cases (9 confirmed, 2 probable) and 3 deaths confirmed by WHO.",
                },
                {
                    "date": "2026-07-02",
                    "event": "WHO reports 13 cases (12 confirmed, 1 probable) and 3 deaths, and closes the event.",
                },
            ],
        }
    ]


def countries() -> list[dict[str, Any]]:
    """Country-level cumulative snapshot.

    USA totals are taken from CDC HPS Surveillance (1993-2023).
    Other endemic countries are coarse historical estimates from
    peer-reviewed literature; we mark them as `estimate`.
    """
    return [
        {
            "iso3": "USA",
            "country": "United States",
            "virus_species": ["SNV", "BAYV", "BCCV"],
            "syndrome": "HPS",
            "cumulative_cases": 864,
            "cumulative_deaths": 312,
            "year_range": [1993, 2023],
            "last_case_reported": "2023-12-31",
            "estimate": False,
            "sources": [
                {
                    "name": "CDC HPS Surveillance",
                    "url": "https://www.cdc.gov/hantavirus/data-research/cases/index.html",
                    "fetched_at": SEED_COMPILED_AT,
                }
            ],
        },
        {
            "iso3": "ARG",
            "country": "Argentina",
            "virus_species": ["ANDV", "LANV"],
            "syndrome": "HPS",
            "cumulative_cases": 1600,
            "cumulative_deaths": 400,
            "year_range": [1995, 2025],
            "last_case_reported": None,
            "estimate": True,
            "sources": [
                {
                    "name": "PAHO (estimate)",
                    "url": "https://www.paho.org/",
                    "fetched_at": SEED_COMPILED_AT,
                }
            ],
        },
        {
            "iso3": "CHL",
            "country": "Chile",
            "virus_species": ["ANDV"],
            "syndrome": "HPS",
            "cumulative_cases": 1100,
            "cumulative_deaths": 350,
            "year_range": [1995, 2025],
            "last_case_reported": None,
            "estimate": True,
            "sources": [
                {
                    "name": "PAHO (estimate)",
                    "url": "https://www.paho.org/",
                    "fetched_at": SEED_COMPILED_AT,
                }
            ],
        },
        {
            "iso3": "BRA",
            "country": "Brazil",
            "virus_species": ["ANDV"],
            "syndrome": "HPS",
            "cumulative_cases": 2200,
            "cumulative_deaths": 900,
            "year_range": [1993, 2025],
            "last_case_reported": None,
            "estimate": True,
            "sources": [
                {
                    "name": "PAHO (estimate)",
                    "url": "https://www.paho.org/",
                    "fetched_at": SEED_COMPILED_AT,
                }
            ],
        },
        {
            "iso3": "PAN",
            "country": "Panama",
            "virus_species": ["CHOV"],
            "syndrome": "HPS",
            "cumulative_cases": 230,
            "cumulative_deaths": 25,
            "year_range": [1999, 2024],
            "last_case_reported": None,
            "estimate": True,
            "sources": [
                {
                    "name": "PAHO (estimate)",
                    "url": "https://www.paho.org/",
                    "fetched_at": SEED_COMPILED_AT,
                }
            ],
        },
        {
            "iso3": "CHN",
            "country": "China",
            "virus_species": ["HTNV", "SEOV"],
            "syndrome": "HFRS",
            "cumulative_cases": 1500000,
            "cumulative_deaths": 47000,
            "year_range": [1950, 2024],
            "last_case_reported": None,
            "estimate": True,
            "sources": [
                {
                    "name": "Literature (estimate, 1950–2024)",
                    "url": "https://pubmed.ncbi.nlm.nih.gov/",
                    "fetched_at": SEED_COMPILED_AT,
                }
            ],
        },
        {
            "iso3": "KOR",
            "country": "South Korea",
            "virus_species": ["HTNV", "SEOV"],
            "syndrome": "HFRS",
            "cumulative_cases": 25000,
            "cumulative_deaths": 300,
            "year_range": [1976, 2024],
            "last_case_reported": None,
            "estimate": True,
            "sources": [
                {
                    "name": "KDCA (estimate)",
                    "url": "https://www.kdca.go.kr/",
                    "fetched_at": SEED_COMPILED_AT,
                }
            ],
        },
        {
            "iso3": "RUS",
            "country": "Russia",
            "virus_species": ["PUUV", "DOBV", "HTNV"],
            "syndrome": "HFRS",
            "cumulative_cases": 200000,
            "cumulative_deaths": 700,
            "year_range": [1978, 2024],
            "last_case_reported": None,
            "estimate": True,
            "sources": [
                {
                    "name": "Rospotrebnadzor (estimate)",
                    "url": "https://www.rospotrebnadzor.ru/",
                    "fetched_at": SEED_COMPILED_AT,
                }
            ],
        },
        {
            "iso3": "FIN",
            "country": "Finland",
            "virus_species": ["PUUV"],
            "syndrome": "HFRS",
            "cumulative_cases": 50000,
            "cumulative_deaths": 30,
            "year_range": [1980, 2024],
            "last_case_reported": None,
            "estimate": True,
            "sources": [
                {
                    "name": "THL Finland (estimate)",
                    "url": "https://www.thl.fi/",
                    "fetched_at": SEED_COMPILED_AT,
                }
            ],
        },
        {
            "iso3": "DEU",
            "country": "Germany",
            "virus_species": ["PUUV", "DOBV", "TULV"],
            "syndrome": "HFRS",
            "cumulative_cases": 25000,
            "cumulative_deaths": 25,
            "year_range": [2001, 2024],
            "last_case_reported": None,
            "estimate": True,
            "sources": [
                {
                    "name": "RKI Germany (estimate)",
                    "url": "https://www.rki.de/",
                    "fetched_at": SEED_COMPILED_AT,
                }
            ],
        },
        {
            "iso3": "SWE",
            "country": "Sweden",
            "virus_species": ["PUUV"],
            "syndrome": "HFRS",
            "cumulative_cases": 10000,
            "cumulative_deaths": 10,
            "year_range": [1990, 2024],
            "last_case_reported": None,
            "estimate": True,
            "sources": [
                {
                    "name": "Folkhälsomyndigheten (estimate)",
                    "url": "https://www.folkhalsomyndigheten.se/",
                    "fetched_at": SEED_COMPILED_AT,
                }
            ],
        },
        {
            "iso3": "FRA",
            "country": "France",
            "virus_species": ["PUUV"],
            "syndrome": "HFRS",
            "cumulative_cases": 2500,
            "cumulative_deaths": 5,
            "year_range": [1990, 2024],
            "last_case_reported": None,
            "estimate": True,
            "sources": [
                {
                    "name": "Santé publique France (estimate)",
                    "url": "https://www.santepubliquefrance.fr/",
                    "fetched_at": SEED_COMPILED_AT,
                }
            ],
        },
        {
            "iso3": "NLD",
            "country": "Netherlands",
            "virus_species": ["PUUV", "SEOV", "ANDV"],
            "syndrome": "mixed",
            "cumulative_cases": 7,
            "cumulative_deaths": 1,
            "year_range": [2010, 2026],
            "last_case_reported": "2026-05-12",
            "estimate": True,
            "sources": [
                {
                    "name": "RIVM (estimate)",
                    "url": "https://www.rivm.nl/",
                    "fetched_at": SEED_COMPILED_AT,
                }
            ],
        },
    ]


def timeline() -> list[dict[str, Any]]:
    """A handful of representative time-series points.

    CDC HPS by year for the US (sampled), plus 2026 weekly points
    for the ANDV cluster countries.
    """
    us_yearly = [
        (1993, 48),
        (1994, 25),
        (1995, 24),
        (1996, 33),
        (1997, 22),
        (1998, 28),
        (1999, 32),
        (2000, 26),
        (2001, 17),
        (2002, 19),
        (2003, 27),
        (2004, 23),
        (2005, 26),
        (2006, 35),
        (2007, 32),
        (2008, 18),
        (2009, 19),
        (2010, 19),
        (2011, 24),
        (2012, 38),
        (2013, 25),
        (2014, 28),
        (2015, 26),
        (2016, 17),
        (2017, 30),
        (2018, 21),
        (2019, 29),
        (2020, 17),
        (2021, 11),
        (2022, 15),
        (2023, 12),
    ]
    out: list[dict[str, Any]] = [
        {
            "iso3": "USA",
            "period": str(year),
            "cases": cases,
            "deaths": 0,
            "syndrome": "HPS",
            "source": "CDC",
        }
        for year, cases in us_yearly
    ]
    out += [
        {
            "iso3": "ARG",
            "period": "2026-W17",
            "cases": 4,
            "deaths": 1,
            "syndrome": "HPS",
            "virus_species": "ANDV",
            "source": "PAHO",
        },
        {
            "iso3": "NLD",
            "period": "2026-W19",
            "cases": 4,
            "deaths": 1,
            "syndrome": "HPS",
            "virus_species": "ANDV",
            "source": "RIVM",
        },
        {
            "iso3": "ESP",
            "period": "2026-W19",
            "cases": 2,
            "deaths": 1,
            "syndrome": "HPS",
            "virus_species": "ANDV",
            "source": "ECDC",
        },
        {
            "iso3": "CAN",
            "period": "2026-W19",
            "cases": 1,
            "deaths": 0,
            "syndrome": "HPS",
            "virus_species": "ANDV",
            "source": "WHO DON",
        },
    ]
    return out


def news() -> list[dict[str, Any]]:
    return [
        {
            "title": "Hantavirus cluster linked to cruise ship travel, Multi-country",
            "url": "https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON600",
            "source": "WHO DON",
            "published_at": "2026-05-07T12:00:00+00:00",
            "tags": ["WHO", "official", "ANDV", "MV Hondius"],
            "country_iso3": ["NLD", "ARG", "ESP"],
        },
        {
            "title": "More hantavirus cases emerge as passengers debark cruise ship",
            "url": "https://www.cidrap.umn.edu/misc-emerging-topics/more-hantavirus-cases-emerge-passengers-debark-cruise-ship",
            "source": "CIDRAP",
            "published_at": "2026-05-12T14:00:00+00:00",
            "tags": ["ANDV", "MV Hondius"],
            "country_iso3": ["NLD", "ESP"],
        },
        {
            "title": "Andes Virus Outbreak on a Cruise Ship: Current Situation",
            "url": "https://www.cdc.gov/hantavirus/situation-summary/index.html",
            "source": "CDC",
            "published_at": "2026-05-11T17:00:00+00:00",
            "tags": ["CDC", "official", "ANDV"],
            "country_iso3": ["USA"],
        },
        {
            "title": "Updates on Andes virus (hantavirus) outbreak on the cruise ship MV Hondius",
            "url": "https://www.government.nl/latest/weblogs/the-work-of-the-ministry-of-foreign-affairs/2026/medical-evacuation-from-cruise-ship-m-v-hondius",
            "source": "Government.nl",
            "published_at": "2026-05-10T09:00:00+00:00",
            "tags": ["official", "ANDV", "MV Hondius"],
            "country_iso3": ["NLD"],
        },
        {
            "title": "Andes hantavirus outbreak in cruise ship",
            "url": "https://www.ecdc.europa.eu/en/infectious-disease-topics/hantavirus-infection/surveillance-and-updates/andes-hantavirus-outbreak",
            "source": "ECDC",
            "published_at": "2026-05-12T08:00:00+00:00",
            "tags": ["ECDC", "official", "ANDV"],
            "country_iso3": ["NLD", "ESP", "DEU", "FRA", "GBR"],
        },
    ]
