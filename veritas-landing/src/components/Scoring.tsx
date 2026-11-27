import { useId, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { CircleCheck, RotateCcw } from 'lucide-react';
import { LINKS } from '../lib/links';
import { cx } from '../lib/hooks';
import { computeScores, SAMPLE_INPUTS, scoreTone, TONE_LABEL } from '../lib/scoring';
import type { ScoreInputs } from '../lib/scoring';
import { Meter, Reveal, ScoreRing, SectionHead } from './ui';
import styles from './Scoring.module.css';

const CRITERIA = [
  {
    name: 'Transparency',
    blurb: 'Does the article show its sources?',
    weight: 30,
    base: 'Base rate a = 0.3',
    items: ['Positive: named citations', 'Negative: none', 'An article has to earn it', 'More citations, higher score'],
  },
  {
    name: 'Credibility',
    blurb: 'Do the facts hold up against open sources?',
    weight: 50,
    base: 'Base rate a = domain reputation',
    featured: true,
    items: [
      'Positive: confirmed claims + 0.2 × citations',
      'Negative: contradicted claims',
      '+ 0.3 × manipulative phrases',
      '+ 0.4 × unverified claims',
      'Below 50 it discounts the whole Trust Score',
    ],
  },
  {
    name: 'Objectivity',
    blurb: 'Is the tone neutral or manipulative?',
    weight: 20,
    base: 'Base rate a = 0.5',
    items: ['Negative: manipulative phrases', 'Capped at K = max(8, words / 50)', 'Quotes and neutral attribution are not counted', 'Scales with article length'],
  },
];

type Field = keyof ScoreInputs;

const CLAIM_FIELDS: Field[] = ['confirmed', 'contradicted', 'unverified'];
const MAX_CLAIMS = 5;

const SLIDERS: Array<{ field: Field; label: string; min: number; max: number; step: number; format?: (v: number) => string }> = [
  { field: 'confirmed', label: 'Confirmed claims', min: 0, max: 5, step: 1 },
  { field: 'contradicted', label: 'Contradicted claims', min: 0, max: 5, step: 1 },
  { field: 'unverified', label: 'Unverified claims', min: 0, max: 5, step: 1 },
  { field: 'citations', label: 'Named citations', min: 0, max: 12, step: 1 },
  { field: 'manipulative', label: 'Manipulative phrases', min: 0, max: 12, step: 1 },
  { field: 'words', label: 'Article length, words', min: 100, max: 3000, step: 50 },
  { field: 'domainTrust', label: 'Domain reputation', min: 0, max: 1, step: 0.05, format: (v) => v.toFixed(2) },
];

function Playground() {
  const [inputs, setInputs] = useState<ScoreInputs>(SAMPLE_INPUTS);
  const scores = useMemo(() => computeScores(inputs), [inputs]);
  const uid = useId();
  const tone = scoreTone(scores.trust);

  const claimsUsed = CLAIM_FIELDS.reduce((sum, f) => sum + inputs[f], 0);

  const set = (field: Field, value: number) => setInputs((prev) => ({ ...prev, [field]: value }));

  return (
    <div className={styles.playground}>
      <div className={styles.pgHead}>
        <div>
          <h3>Try the model</h3>
          <p>
            The same formulas as{' '}
            <a href={LINKS.scoringSource} target="_blank" rel="noreferrer">
              backend/app/services/scoring.py
            </a>
            , running in your browser.
          </p>
        </div>
        <button type="button" className="btn btn--sm" onClick={() => setInputs(SAMPLE_INPUTS)}>
          <RotateCcw size={15} aria-hidden="true" /> Reset
        </button>
      </div>

      <div className={styles.pgBody}>
        <div className={styles.sliders}>
          {SLIDERS.map((s) => {
            const id = `${uid}-${s.field}`;
            const value = inputs[s.field];
            // The extractor returns at most five claims in total.
            const max = CLAIM_FIELDS.includes(s.field) ? Math.min(s.max, MAX_CLAIMS - claimsUsed + value) : s.max;
            return (
              <div key={s.field} className={styles.slider}>
                <label htmlFor={id}>{s.label}</label>
                <output htmlFor={id}>{s.format ? s.format(value) : value}</output>
                <input
                  id={id}
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={value}
                  onChange={(e) => set(s.field, Math.min(Number(e.target.value), max))}
                  style={{ '--fill': `${((value - s.min) / (s.max - s.min)) * 100}%` } as CSSProperties}
                />
              </div>
            );
          })}
          <p className={styles.note}>
            Claims used: {claimsUsed} of {MAX_CLAIMS}. Longer articles tolerate more manipulative phrases: K = max(8, words / 50).
          </p>
        </div>

        <div className={styles.result}>
          <ScoreRing value={scores.trust} size={168} stroke={9} />
          <p className={cx(styles.verdict, `tone-${tone}`)}>{TONE_LABEL[tone]}</p>
          <div className={styles.meters}>
            <Meter label="Credibility · 50%" value={scores.credibility} />
            <Meter label="Transparency · 30%" value={scores.transparency} />
            <Meter label="Objectivity · 20%" value={scores.objectivity} />
          </div>
          <p className={styles.discount} data-on={scores.discounted}>
            {scores.discounted
              ? `Credibility is below 50, so the score is multiplied by ${(0.5 + scores.credibility / 100).toFixed(2)}.`
              : 'Credibility is 50 or higher: no discount applied.'}
          </p>
        </div>
      </div>
    </div>
  );
}

export function Scoring() {
  return (
    <section id="scoring" className={cx('section', styles.section)} aria-labelledby="scoring-title">
      <div className="container">
        <SectionHead
          id="scoring-title"
          eyebrow="The model"
          title="Simple, transparent scoring"
          lead="Three criteria, fixed weights and every input visible on the analytics page. No hidden prompts deciding the number."
        />

        <div className={styles.cards}>
          {CRITERIA.map((c, i) => (
            <Reveal key={c.name} delay={i * 90} className={cx(styles.card, c.featured && styles.featured)}>
              {c.featured && <span className={styles.flag}>Heaviest weight</span>}
              <h3>{c.name}</h3>
              <p className={styles.blurb}>{c.blurb}</p>
              <p className={styles.weight}>
                <b>{c.weight}%</b> of Trust Score
              </p>
              <p className={styles.base}>{c.base}</p>
              <ul role="list" className={styles.items}>
                {c.items.map((item) => (
                  <li key={item}>
                    <CircleCheck size={16} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className={styles.equation}>
            Each criterion is a Beta Reputation System expectation <b>E(p) = (r + W·a) / (r + s + W)</b> with <b>W = 2</b>.
          </p>
        </Reveal>

        <Reveal>
          <Playground />
        </Reveal>
      </div>
    </section>
  );
}
