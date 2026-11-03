// Port of backend/app/services/scoring.py (Beta Reputation System, Jøsang & Ismail 2002).
const brs = (r: number, s: number, a: number, W = 2) => (r + W * a) / (r + s + W);
const clamp = (v: number) => Math.max(0, Math.min(100, v));

export interface ScoreInputs {
  confirmed: number;
  contradicted: number;
  unverified: number;
  citations: number;
  manipulative: number;
  words: number;
  domainTrust: number; // 0..1
}

export function computeScores(i: ScoreInputs) {
  const r = i.confirmed + i.citations * 0.2;
  const s = i.contradicted + i.manipulative * 0.3 + i.unverified * 0.4;
  const credibility = clamp(brs(r, s, i.domainTrust) * 100);
  const transparency = clamp(brs(i.citations, 0, 0.3) * 100);
  const K = Math.max(8, Math.floor(i.words / 50));
  const sObj = Math.min(i.manipulative, K);
  const objectivity = clamp(brs(K - sObj, sObj, 0.5) * 100);

  let trust = 0.5 * credibility + 0.3 * transparency + 0.2 * objectivity;
  if (credibility < 50) trust *= 0.5 + credibility / 100;
  trust = clamp(Math.round(trust * 10) / 10);
  return { credibility, transparency, objectivity, trust, K, r, s };
}

export const scoreTone = (v: number) => (v >= 70 ? 'high' : v >= 40 ? 'mid' : 'low') as 'high' | 'mid' | 'low';
export const toneColor = (v: number) => `var(--score-${scoreTone(v)})`;
export const toneLabel = (v: number) => (v >= 70 ? 'Credible' : v >= 40 ? 'Caution' : 'High risk');
