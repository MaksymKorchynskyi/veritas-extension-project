import pytest

from app.services.domain_reputation import LOCAL_DOMAINS_REPUTATION, find_local_reputation


def test_exact_match() -> None:
    assert find_local_reputation("bbc.com") is LOCAL_DOMAINS_REPUTATION["bbc.com"]


@pytest.mark.parametrize(
    "domain", ["www.bbc.com", "WWW.BBC.COM", "m.bbc.com", "a.b.bbc.com", "bbc.com."]
)
def test_prefix_and_subdomains_resolve_to_registered_domain(domain: str) -> None:
    assert find_local_reputation(domain) is LOCAL_DOMAINS_REPUTATION["bbc.com"]


@pytest.mark.parametrize(
    "domain", ["", "com", "unknown-site.example", "notbbc.com", "bbc.com.evil.org"]
)
def test_unknown_domains_return_none(domain: str) -> None:
    assert find_local_reputation(domain) is None


def test_every_record_is_well_formed() -> None:
    for domain, record in LOCAL_DOMAINS_REPUTATION.items():
        assert domain == domain.lower()
        assert 0.0 <= record["trust_index"] <= 1.0
        assert record["summary"]
