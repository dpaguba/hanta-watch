"""Shared HTTP helpers."""

from __future__ import annotations

import logging

import httpx

log = logging.getLogger(__name__)

USER_AGENT = (
    "hanta-watch-etl/0.1 (+https://github.com/dpaguba/hanta-watch) "
    "polite-bot; contact via GitHub issues"
)


class FetchError(RuntimeError):
    """The endpoint could not be read: DNS, timeout, TLS, 4xx or 5xx."""


def get(url: str, *, timeout: float = 30.0) -> httpx.Response:
    """GET with our user agent and timeout.

    Raises `FetchError` when the endpoint cannot be read, so a blocked or
    unreachable source is recorded as an error rather than as a quiet week.

    Redirects are followed: several public health sites moved to a canonical
    host and answer the old address with a permanent redirect.
    """
    try:
        r = httpx.get(
            url,
            timeout=timeout,
            headers={"User-Agent": USER_AGENT},
            follow_redirects=True,
        )
        r.raise_for_status()
        return r
    except Exception as e:  # noqa: BLE001, we want this broad on purpose
        log.warning("GET %s failed: %s", url, e)
        raise FetchError(f"{type(e).__name__}: {e}") from e
