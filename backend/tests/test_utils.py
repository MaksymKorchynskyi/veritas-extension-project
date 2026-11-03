import pytest

from app.utils import get_domain


@pytest.mark.parametrize(
    ("url", "expected"),
    [
        ("https://www.bbc.com/news/x", "bbc.com"),
        ("http://pravda.com.ua/a", "pravda.com.ua"),
        ("https://m.bbc.com/x", "m.bbc.com"),
        ("https://Example.COM:8080/p", "example.com"),
        ("https://user:secret@host.org/x", "host.org"),
        ("ftp://files.example.org", "files.example.org"),
        ("", ""),
        ("not a url", ""),
        ("https://[broken/path", ""),
    ],
)
def test_get_domain(url: str, expected: str) -> None:
    assert get_domain(url) == expected
