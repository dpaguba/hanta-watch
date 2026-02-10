from etl.dedupe import dedupe_news, news_id


def test_news_id_is_stable():
    a = news_id("WHO confirms 11 cases", "https://www.who.int/x")
    b = news_id("WHO confirms 11 cases", "https://www.who.int/x")
    assert a == b


def test_news_id_normalizes_title():
    a = news_id("WHO confirms 11 cases!", "https://who.int/x")
    b = news_id("WHO  confirms 11 cases.", "https://who.int/x")
    assert a == b


def test_news_id_distinguishes_hosts():
    a = news_id("Same headline", "https://who.int/x")
    b = news_id("Same headline", "https://cdc.gov/x")
    assert a != b


def test_dedupe_drops_duplicates():
    items = [
        {"title": "X", "url": "https://a.com/1"},
        {"title": "X", "url": "https://a.com/2"},  # same host & title → dup
        {"title": "Y", "url": "https://a.com/3"},
    ]
    out = dedupe_news(items)
    assert len(out) == 2
    assert all("id" in it for it in out)


def test_dedupe_preserves_first():
    items = [
        {"title": "x", "url": "https://a.com/1"},
        {"title": "x", "url": "https://a.com/1"},
    ]
    out = dedupe_news(items)
    assert len(out) == 1
    assert out[0]["url"] == "https://a.com/1"
