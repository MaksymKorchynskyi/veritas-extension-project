import { toneColor, toneLabel } from '../lib/scoring';
import { useTween } from '../lib/hooks';

const R = 74;
const C = 2 * Math.PI * R;

export function ScoreRing({ value, active = true }: { value: number; active?: boolean }) {
  const shown = useTween(active ? value : 0, 0.9);
  const color = toneColor(shown);
  return (
    <div className="ring-wrap">
      <svg width="170" height="170" viewBox="0 0 170 170" aria-hidden>
        <circle cx="85" cy="85" r={R} fill="none" stroke="rgba(141,110,99,0.2)" strokeWidth="9" />
        <circle
          cx="85" cy="85" r={R} fill="none" strokeWidth="9" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - shown / 100)}
          style={{ stroke: color }}
        />
      </svg>
      <div className="ring-center">
        <b style={{ color }}>{Math.round(shown)}</b>
        <span>{active ? toneLabel(shown) : 'Analyzing…'}</span>
      </div>
    </div>
  );
}

export function Bar({ label, value, active = true }: { label: string; value: number; active?: boolean }) {
  const shown = useTween(active ? value : 0, 0.8);
  return (
    <div className="bar-row">
      <div className="lab"><span>{label}</span><span>{Math.round(shown)}/100</span></div>
      <div className="bar"><i style={{ width: `${shown}%`, background: toneColor(shown) }} /></div>
    </div>
  );
}
