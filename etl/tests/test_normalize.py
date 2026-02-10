from etl.normalize import normalize_country, normalize_title, normalize_virus


def test_country_basic():
    assert normalize_country("United States") == "USA"
    assert normalize_country("usa") == "USA"
    assert normalize_country("The Netherlands") == "NLD"


def test_country_unknown():
    assert normalize_country("Atlantis") is None
    assert normalize_country("") is None


def test_virus_aliases():
    assert normalize_virus("Andes virus") == "ANDV"
    assert normalize_virus("Puumala") == "PUUV"
    assert normalize_virus("puuv") == "PUUV"
    assert normalize_virus("sin   nombre") == "SNV"
    assert normalize_virus("definitely-not-a-virus") is None


def test_title_normalization():
    assert normalize_title("Hello, World!") == "hello world"
    assert normalize_title("Hantavirus cluster, NEW") == "hantavirus cluster new"
