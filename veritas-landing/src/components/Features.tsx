import { CircleX, Sigma, Star, TriangleAlert } from 'lucide-react';
import { SAMPLE_SCORES, TONE_LABEL, scoreTone } from '../lib/scoring';
import { useInView } from '../lib/hooks';
import { Meter, Reveal, SectionHead, VerdictBadge } from './ui';
import type { Verdict } from './ui';
import styles from './Features.module.css';

const s = SAMPLE_SCORES;
const trust = Math.round(s.trust);

const CLAIMS: Array<{ text: string; verdict: Verdict }> = [
  { text: 'Fare rises from $2.75 to $3.50 in January', verdict: 'confirmed' },
  { text: 'Council vote held on March 14', verdict: 'confirmed' },
  { text: 'Ridership fell by 40% last year', verdict: 'contradicted' },
  { text: 'Two more routes to close in spring', verdict: 'unverified' },
];

const OUTLETS = ['S', 'P', 'U', 'L'];

const WEIGHTS = [
  { label: 'Credibility', weight: 50, color: 'var(--c-olive)' },
  { label: 'Transparency', weight: 30, color: 'var(--c-amber)' },
  { label: 'Objectivity', weight: 20, color: 'var(--c-taupe)' },
];

const DONUT = { size: 132, stroke: 14, gap: 4 };
const DONUT_C = 2 * Math.PI * ((DONUT.size - DONUT.stroke) / 2);
/** Each weight as a dash on the ring, offset by the weights before it. */
const SEGMENTS = WEIGHTS.map((w, i) => ({
  ...w,
  length: (w.weight / 100) * DONUT_C - DONUT.gap,
  offset: (WEIGHTS.slice(0, i).reduce((sum, p) => sum + p.weight, 0) / 100) * DONUT_C,
}));

function WeightsDonut() {
  const { size, stroke } = DONUT;
  const mid = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      {SEGMENTS.map((seg) => (
        <circle
          key={seg.label}
          cx={mid}
          cy={mid}
          r={(size - stroke) / 2}
          fill="none"
          stroke={seg.color}
          strokeWidth={stroke}
          strokeDasharray={`${seg.length} ${DONUT_C - seg.length}`}
          strokeDashoffset={-seg.offset}
          transform={`rotate(-90 ${mid} ${mid})`}
        />
      ))}
    </svg>
  );
}

export function Features() {
  const [gridRef, inView] = useInView<HTMLDivElement>();
  const tone = scoreTone(s.trust);

  return (
    <section id="features" className="section" aria-labelledby="features-title">
      <div className="container">
        <SectionHead
          id="features-title"
          eyebrow="Core features"
          title={
            <>
              Clear evidence and honest scores
              <br /> for every article you read
            </>
          }
        />

        <div ref={gridRef} className={styles.grid}>
          {/* A — real-time result */}
          <Reveal className={`${styles.card} ${styles.dark} ${styles.a}`}>
            <div className={styles.phone} aria-hidden="true">
              <div className={styles.phoneTop}>
                <span>9 s</span>
                <span className={styles.phoneDots}>
                  <i />
                  <i />
                </span>
              </div>
              <p className={styles.phoneTitle}>Your Trust Score is ready.</p>
              <p className={styles.phoneText}>dailycourier.example · 4 claims checked against open sources.</p>
              <div className={styles.result}>
                <p className={styles.resultSite}>dailycourier.example</p>
                <p className={styles.resultScore}>
                  <b>{trust}</b>/100 · {TONE_LABEL[tone]}
                </p>
                <div className={styles.resultMeters}>
                  <Meter label="Credibility" value={s.credibility} active={inView} />
                  <Meter label="Transparency" value={s.transparency} active={inView} />
                  <Meter label="Objectivity" value={s.objectivity} active={inView} />
                </div>
              </div>
              <div className={styles.phoneRows}>
                <span>
                  Claims confirmed <b>3 / 4</b>
                </span>
                <span>
                  Manipulative phrases <b>1</b>
                </span>
                <span>
                  Domain reputation <b>0.80</b>
                </span>
              </div>
            </div>
            <div className={styles.aCopy}>
              <h3>Real-time analysis</h3>
              <p>One click in the toolbar, a full result in 5 to 15 seconds. Ukrainian and English UI.</p>
            </div>
          </Reveal>

          {/* B — cross-verification */}
          <Reveal className={`${styles.card} ${styles.light} ${styles.b}`} delay={80}>
            <div className={styles.copy}>
              <h3 className={styles.big}>Cross-verification</h3>
              <p>Up to five verifiable claims (figures, dates, concrete events) are checked against open sources, each with an evidence link.</p>
            </div>
            <div className={styles.claimsPhone} aria-hidden="true">
              <p className={styles.claimsHead}>Extracted claims</p>
              <ul role="list">
                {CLAIMS.map((c) => (
                  <li key={c.text}>
                    <span>{c.text}</span>
                    <VerdictBadge verdict={c.verdict} />
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.verdictCard} aria-hidden="true">
              <span>Verdicts</span>
              <b>2 confirmed</b>
              <em>1 contradicted</em>
            </div>
          </Reveal>

          {/* C — in-page highlights */}
          <Reveal className={`${styles.card} ${styles.dark} ${styles.c}`} delay={120}>
            <div className={styles.rings} aria-hidden="true" />
            <div className={styles.copy}>
              <h3>In-page highlights</h3>
              <p>Contradicted claims and manipulative phrases are marked right in the article, with the reason.</p>
            </div>
            <div className={styles.notes} aria-hidden="true">
              <div className={styles.note}>
                <TriangleAlert size={15} />
                <span>
                  <small>Manipulative phrase</small>“a shocking decision”
                </span>
              </div>
              <div className={`${styles.note} ${styles.noteRisk}`}>
                <CircleX size={15} />
                <span>
                  <small>Contradicted claim</small>“lost 40% of its riders”
                </span>
              </div>
            </div>
          </Reveal>

          {/* D — domain reputation */}
          <Reveal className={`${styles.card} ${styles.light} ${styles.d}`} delay={160}>
            <h3 className={styles.centerTitle}>
              54 outlets
              <br /> rated locally
            </h3>
            <div className={styles.avatars} aria-hidden="true">
              {OUTLETS.map((o) => (
                <span key={o}>{o}</span>
              ))}
              <span className={styles.more}>50+</span>
            </div>
            <p className={styles.fine}>
              <Star size={13} aria-hidden="true" /> plus an LLM lookup for the rest
            </p>
          </Reveal>

          {/* E — transparent model */}
          <Reveal className={`${styles.card} ${styles.olive} ${styles.e}`}>
            <div className={styles.copy}>
              <h3>Transparent by design</h3>
              <p>LLMs only gather evidence. Every score comes from a deterministic, unit-tested Beta Reputation System model.</p>
            </div>
            <div className={styles.formulaCard} aria-hidden="true">
              <span className={styles.formulaIcon}>
                <Sigma size={20} />
              </span>
              <b>E(p) = (r + W·a) / (r + s + W)</b>
              <small>W = 2 · prior weight</small>
            </div>
          </Reveal>

          {/* F — three criteria */}
          <Reveal className={`${styles.card} ${styles.light} ${styles.f}`} delay={80}>
            <div className={styles.copy}>
              <h3>Three criteria, one score</h3>
              <p>Credibility, Transparency and Objectivity, combined with fixed weights you can read in the source.</p>
            </div>
            <div className={styles.donutCard}>
              <p className={styles.donutTitle}>Trust Score weights</p>
              <p className={styles.donutSub}>How the final number is built.</p>
              <div className={styles.donut}>
                <WeightsDonut />
                <span>
                  <small>sum</small>100%
                </span>
              </div>
              <ul role="list" className={styles.legend}>
                {WEIGHTS.map((w) => (
                  <li key={w.label}>
                    <i style={{ background: w.color }} aria-hidden="true" />
                    {w.label} <b>{w.weight}%</b>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
