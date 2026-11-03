import { useState } from 'react';
import { motion } from 'framer-motion';
import { computeScores, toneColor, type ScoreInputs } from '../lib/scoring';
import { Bar, ScoreRing } from './ScoreRing';
import { MaskLines, FadeUp } from './Reveal';

const PRESETS: { name: string; v: ScoreInputs }[] = [
  { name: 'Quality article', v: { confirmed: 3, contradicted: 0, unverified: 1, citations: 6, manipulative: 0, words: 800, domainTrust: 0.85 } },
  { name: 'Clickbait', v: { confirmed: 1, contradicted: 1, unverified: 3, citations: 1, manipulative: 6, words: 400, domainTrust: 0.4 } },
  { name: 'Propaganda', v: { confirmed: 0, contradicted: 3, unverified: 2, citations: 0, manipulative: 9, words: 500, domainTrust: 0.2 } },
];

function Radar({ c, t, o }: { c: number; t: number; o: number }) {
  const cx = 120, cy = 120, R = 92;
  const pt = (i: number, v: number) => {
    const a = (2 * Math.PI * i) / 3 - Math.PI / 2;
    const r = (R * v) / 100;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const poly = (vals: number[]) => vals.map((v, i) => pt(i, v).join(',')).join(' ');
  const avg = (c + t + o) / 3;
  return (
    <svg className="radar" viewBox="0 0 240 240" role="img" aria-label="Radar of the three criteria">
      {[100, 66, 33].map((l) => <polygon key={l} points={poly([l, l, l])} fill="none" stroke="rgba(239,233,225,0.22)" />)}
      {[0, 1, 2].map((i) => { const [x, y] = pt(i, 100); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(239,233,225,0.22)" />; })}
      <motion.polygon animate={{ points: poly([c, t, o]) }} transition={{ type: 'spring', stiffness: 90, damping: 16 }} fill={toneColor(avg)} fillOpacity={0.35} stroke={toneColor(avg)} strokeWidth={2.5} strokeLinejoin="round" />
      <text x="120" y="12" textAnchor="middle" fontSize="10" fill="#EFE9E1">Credibility</text>
      <text x="228" y="196" textAnchor="end" fontSize="10" fill="#EFE9E1">Objectivity</text>
      <text x="12" y="196" fontSize="10" fill="#EFE9E1">Transparency</text>
    </svg>
  );
}

function Slider({ label, hint, value, min, max, step = 1, fmt, onChange }: { label: string; hint: string; value: number; min: number; max: number; step?: number; fmt?: (v: number) => string; onChange: (v: number) => void }) {
  return (
    <div className="slider-row">
      <div className="top"><div>{label}<small>{hint}</small></div><output>{fmt ? fmt(value) : value}</output></div>
      <input type="range" aria-label={label} min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

export function Calculator() {
  const [v, setV] = useState<ScoreInputs>(PRESETS[0].v);
  const [preset, setPreset] = useState(0);
  const set = (k: keyof ScoreInputs) => (x: number) => { setPreset(-1); setV((p) => ({ ...p, [k]: x })); };
  const s = computeScores(v);
  const claimsLeft = (k: 'confirmed' | 'contradicted' | 'unverified') => 5 - (v.confirmed + v.contradicted + v.unverified - v[k]);

  return (
    <section className="calc" id="model">
      <div className="container">
        <div className="section-head center">
          <FadeUp><div className="eyebrow">Scoring model</div></FadeUp>
          <MaskLines className="section-title" lines={[<>Turn the formula</>, <span key="y" className="em accent-mid">yourself</span>]} />
          <FadeUp delay={0.2}><p className="section-lead">This is the same math that runs in the backend: the Beta Reputation System by Jøsang and Ismail (2002). Change the evidence and watch the score move.</p></FadeUp>
        </div>

        <div className="calc-grid">
          <div className="calc-panel">
            <div className="presets">
              {PRESETS.map((p, i) => <button key={p.name} className={`preset ${preset === i ? 'on' : ''}`} onClick={() => { setPreset(i); setV(p.v); }}>{p.name}</button>)}
            </div>
            <Slider label="Confirmed claims" hint="weight 1.0 in r" value={v.confirmed} min={0} max={claimsLeft('confirmed')} onChange={set('confirmed')} />
            <Slider label="Contradicted claims" hint="weight 1.0 in s" value={v.contradicted} min={0} max={claimsLeft('contradicted')} onChange={set('contradicted')} />
            <Slider label="Unverified claims" hint="weight 0.4 in s" value={v.unverified} min={0} max={claimsLeft('unverified')} onChange={set('unverified')} />
            <Slider label="Citations in text" hint="weight 0.2 in r; drives Transparency" value={v.citations} min={0} max={15} onChange={set('citations')} />
            <Slider label="Manipulative phrases" hint="weight 0.3 in s; lowers Objectivity" value={v.manipulative} min={0} max={15} onChange={set('manipulative')} />
            <Slider label="Article length, words" hint="K = max(8, words / 50)" value={v.words} min={100} max={3000} step={100} onChange={set('words')} />
            <Slider label="Domain reputation" hint="base rate a" value={Math.round(v.domainTrust * 100)} min={0} max={100} step={5} fmt={(x) => `${x}%`} onChange={(x) => set('domainTrust')(x / 100)} />
          </div>

          <div className="calc-panel calc-out">
            <ScoreRing value={s.trust} />
            <Radar c={s.credibility} t={s.transparency} o={s.objectivity} />
            <div className="bars" style={{ width: '100%' }}>
              <Bar label="Credibility · 50%" value={s.credibility} />
              <Bar label="Transparency · 30%" value={s.transparency} />
              <Bar label="Objectivity · 20%" value={s.objectivity} />
            </div>
            <div className="calc-formula">
              E = (r + W·a) / (r + s + W), W = 2<br />
              Credibility: r=<b>{s.r.toFixed(1)}</b> s=<b>{s.s.toFixed(1)}</b> a=<b>{v.domainTrust.toFixed(2)}</b><br />
              Trust = 0.5·C + 0.3·T + 0.2·O{s.credibility < 50 && <> → ×<b>{(0.5 + s.credibility / 100).toFixed(2)}</b> (C &lt; 50)</>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
