"""Pydantic schema for everything the ETL produces.

All JSON payloads carry `schema_version: "1"`. Breaking changes bump the major.
"""

from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

SCHEMA_VERSION = "1"

Syndrome = Literal["HPS", "HFRS", "mixed"]


class Source(BaseModel):
    name: str
    url: str
    fetched_at: datetime | None = None


class CountryRecord(BaseModel):
    """A country's cumulative figures.

    `estimate` is part of the record rather than a hint inside a source name,
    so the interface can mark the number where it is shown.
    """

    iso3: str
    country: str
    virus_species: list[str] = Field(default_factory=list)
    syndrome: Syndrome
    estimate: bool = False
    cumulative_cases: int = 0
    cumulative_deaths: int = 0
    year_range: tuple[int, int] | None = None
    last_case_reported: str | None = None
    sources: list[Source] = Field(default_factory=list)


class TimelinePoint(BaseModel):
    iso3: str
    period: str  # "2023" or "2026-W18"
    cases: int = 0
    deaths: int = 0
    syndrome: Syndrome
    virus_species: str | None = None
    source: str


class OutbreakTimelineEvent(BaseModel):
    date: str
    event: str


class Outbreak(BaseModel):
    id: str
    name: str
    started: str
    status: Literal["active", "monitored", "closed"]
    virus_species: str
    syndrome: Syndrome
    countries: list[str]
    cases_confirmed: int = 0
    cases_probable: int = 0
    deaths: int = 0
    human_to_human: bool = False
    summary: str
    sources: list[Source] = Field(default_factory=list)
    timeline: list[OutbreakTimelineEvent] = Field(default_factory=list)


class NewsItem(BaseModel):
    id: str  # sha256
    title: str
    url: str
    source: str
    published_at: datetime
    tags: list[str] = Field(default_factory=list)
    country_iso3: list[str] = Field(default_factory=list)


class SourceRun(BaseModel):
    ok: bool
    state: Literal["ok", "empty", "error"] = "ok"
    fetched_at: datetime
    items: int
    error: str | None = None


class Meta(BaseModel):
    schema_version: str = SCHEMA_VERSION
    generated_at: datetime
    source_runs: dict[str, SourceRun] = Field(default_factory=dict)
    counts: dict[str, int] = Field(default_factory=dict)
