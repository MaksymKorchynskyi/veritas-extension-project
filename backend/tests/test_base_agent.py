import asyncio
from types import SimpleNamespace
from typing import Any

import pytest
from pydantic import BaseModel

from app.services.llm import base_agent


class Answer(BaseModel):
    value: str


class FakeCompletions:
    """Plays back a scripted list of outcomes: an exception, "hang", or a response object."""

    def __init__(self, outcomes: list[Any]) -> None:
        self.outcomes = list(outcomes)
        self.models: list[str] = []
        self.configs: list[Any] = []

    async def create(self, *, model: str, config: Any, **_: Any) -> Any:
        self.models.append(model)
        self.configs.append(config)
        outcome = self.outcomes.pop(0)
        if isinstance(outcome, BaseException):
            raise outcome
        if outcome == "hang":
            await asyncio.Event().wait()
        return outcome


@pytest.fixture
def sleeps(monkeypatch: pytest.MonkeyPatch) -> list[float]:
    recorded: list[float] = []

    async def fake_sleep(delay: float) -> None:
        recorded.append(delay)

    monkeypatch.setattr("app.services.llm.base_agent.asyncio.sleep", fake_sleep)
    return recorded


def _install(monkeypatch: pytest.MonkeyPatch, outcomes: list[Any]) -> FakeCompletions:
    completions = FakeCompletions(outcomes)
    client = SimpleNamespace(chat=SimpleNamespace(completions=completions))
    monkeypatch.setattr(base_agent, "get_client", lambda: client)
    return completions


async def test_returns_none_without_client() -> None:
    assert not base_agent.ai_available()
    assert await base_agent.run_agent("p", "s", Answer) is None


async def test_returns_first_successful_response(monkeypatch: pytest.MonkeyPatch) -> None:
    completions = _install(monkeypatch, [Answer(value="ok")])
    assert base_agent.ai_available()
    assert await base_agent.run_agent("p", "s", Answer) == Answer(value="ok")
    assert completions.models == [base_agent.MODEL_NAME]


async def test_retries_alternate_models_with_growing_delay(
    monkeypatch: pytest.MonkeyPatch, sleeps: list[float]
) -> None:
    completions = _install(monkeypatch, [RuntimeError("a"), RuntimeError("b"), Answer(value="ok")])
    assert await base_agent.run_agent("p", "s", Answer) == Answer(value="ok")
    assert completions.models == [
        base_agent.MODEL_NAME,
        base_agent.FALLBACK_MODEL_NAME,
        base_agent.MODEL_NAME,
    ]
    assert sleeps == [2, 4]


async def test_gives_up_after_max_retries(
    monkeypatch: pytest.MonkeyPatch, sleeps: list[float]
) -> None:
    completions = _install(monkeypatch, [RuntimeError("x")] * 4)
    assert await base_agent.run_agent("p", "s", Answer) is None
    assert len(completions.models) == 4
    assert sleeps == [2, 4, 6]


async def test_custom_retry_policy(monkeypatch: pytest.MonkeyPatch, sleeps: list[float]) -> None:
    completions = _install(monkeypatch, [RuntimeError("x"), RuntimeError("y")])
    result = await base_agent.run_agent("p", "s", Answer, max_retries=2, retry_delay=1.0)
    assert result is None
    assert completions.models == [base_agent.MODEL_NAME, base_agent.FALLBACK_MODEL_NAME]
    assert sleeps == [1.0]


async def test_custom_generation_config_is_forwarded(monkeypatch: pytest.MonkeyPatch) -> None:
    completions = _install(monkeypatch, [Answer(value="ok")])
    config = object()
    await base_agent.run_agent("p", "s", Answer, generation_config=config)  # type: ignore[arg-type]
    assert completions.configs == [config]


async def test_default_generation_config_values() -> None:
    config = base_agent.default_generation_config()
    assert (config.temperature, config.top_p, config.top_k, config.max_output_tokens) == (
        0.05,
        0.8,
        40,
        8192,
    )


async def test_hanging_call_times_out_and_is_retried(
    monkeypatch: pytest.MonkeyPatch, sleeps: list[float]
) -> None:
    monkeypatch.setattr(base_agent, "LLM_CALL_TIMEOUT_S", 0.01)
    completions = _install(monkeypatch, ["hang", Answer(value="recovered")])
    assert await base_agent.run_agent("p", "s", Answer) == Answer(value="recovered")
    assert completions.models == [base_agent.MODEL_NAME, base_agent.FALLBACK_MODEL_NAME]
    assert sleeps == [2]
