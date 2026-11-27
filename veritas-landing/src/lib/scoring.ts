/**
 * Port of backend/app/services/scoring.py
 * (Beta Reputation System, Jøsang & Ismail 2002).
 *
 * Keep this file in sync with the backend: the landing page uses it for
 * every number it shows, so the mock-ups never drift from the real model.
 */

/** BRS expectation E(p) = (r + W·a) / (r + s + W). */
export const brs = (r: number, s: number, a: number, W = 2) => (r + W * a) / (r + s + W);

const clamp = (v: number) => Math.max(0, Math.min(100, v));

export interface ScoreInputs {
  confirmed: number;
  contradicted: number;
  unverified: number;
  citations: number;
  manipulative: number;
  words: number;
  /** Domain reputation, 0..1 (neutral default 0.5). */
  domainTrust: number;
}

export interface Scores {
  credibility: number;
  transparency: number;
  objectivity: number;
  trust: number;
  /** True when the low-credibility discount was applied. */
  discounted: boolean;
}

export function computeScores(i: ScoreInputs): Scores {
  const r = i.confirmed + i.citations * 0.2;
  const s = i.contradicted + i.manipulative * 0.3 + i.unverified * 0.4;
  const credibility = clamp(brs(r, s, i.domainTrust) * 100);

  const transparency = clamp(brs(i.citations, 0, 0.3) * 100);

  const K = Math.max(8, Math.floor(i.words / 50));
  const sObj = Math.min(i.manipulative, K);
  const objectivity = clamp(brs(K - sObj, sObj, 0.5) * 100);

  let trust = 0.5 * credibility + 0.3 * transparency + 0.2 * objectivity;
  const discounted = credibility < 50;
  if (discounted) trust *= 0.5 + credibility / 100;

  return {
    credibility,
    transparency,
    objectivity,
    trust: clamp(Math.round(trust * 10) / 10),
    discounted,
  };
}

export type Tone = 'high' | 'mid' | 'low';

/** Same thresholds as the extension popup (extension/popup.js). */
export const scoreTone = (v: number): Tone => (v >= 70 ? 'high' : v >= 40 ? 'mid' : 'low');

export const TONE_LABEL: Record<Tone, string> = {
  high: 'Credible',
  mid: 'Caution',
  low: 'High risk',
};

/** The sample article used by the hero and feature mock-ups. */
export const SAMPLE_INPUTS: ScoreInputs = {
  confirmed: 3,
  contradicted: 0,
  unverified: 1,
  citations: 4,
  manipulative: 1,
  words: 600,
  domainTrust: 0.8,
};

export const SAMPLE_SCORES = computeScores(SAMPLE_INPUTS);
