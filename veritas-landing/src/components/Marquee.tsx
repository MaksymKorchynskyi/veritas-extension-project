const ITEMS = ['Google Gemini', 'DuckDuckGo cross-verification', 'Beta Reputation System', 'Readability.js', 'FastAPI · asyncio', 'Pydantic v2', 'Chrome Extension MV3', 'Ukrainian / English'];

export function Marquee() {
  const row = (
    <div className="marquee-item">
      {ITEMS.map((t) => (<span key={t} style={{ display: 'contents' }}><span>{t}</span><i /></span>))}
    </div>
  );
  return (
    <div className="marquee" role="presentation" aria-hidden>
      <div className="marquee-track">{row}{row}</div>
      <div className="marquee-track">{row}{row}</div>
    </div>
  );
}
