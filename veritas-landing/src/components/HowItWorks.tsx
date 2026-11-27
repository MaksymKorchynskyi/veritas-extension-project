import { useId, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent, ReactNode } from 'react';
import { Search } from 'lucide-react';
import { SAMPLE_SCORES } from '../lib/scoring';
import { cx } from '../lib/hooks';
import { Reveal, ScoreRing, VerdictBadge } from './ui';
import styles from './HowItWorks.module.css';

interface Tab {
  id: string;
  label: string;
  title: ReactNode;
  text: string;
  tiles: [ReactNode, ReactNode];
}

const TABS: Tab[] = [
  {
    id: 'extract',
    label: 'Extract',
    title: (
      <>
        Pull out what
        <br /> can be checked
      </>
    ),
    text: 'Readability.js turns the page into numbered paragraphs. An LLM agent picks up to five verifiable claims (figures, dates, concrete events) and leaves opinions and predictions out.',
    tiles: [
      <div className={styles.mini}>
        <span className={styles.tag}>¶ 3</span>
        <p className={styles.para}>
          According to the city council, <u>a single ride will rise from $2.75 to $3.50</u> next January. Officials expect the change to
          be unpopular.
        </p>
      </div>,
      <div className={cx(styles.mini, styles.code)}>
        <span>{'{'}</span>
        <span>
          &nbsp;&nbsp;<i>"paragraph_id"</i>: 3,
        </span>
        <span>
          &nbsp;&nbsp;<i>"claim_text"</i>: "Ride fare rises from $2.75 to $3.50"
        </span>
        <span>{'}'}</span>
      </div>,
    ],
  },
  {
    id: 'verify',
    label: 'Cross-verify',
    title: (
      <>
        Check every claim
        <br /> against open sources
      </>
    ),
    text: 'A query agent writes a 3 to 7 keyword search, DuckDuckGo returns the top three snippets and a verdict agent answers confirmed, contradicted or unverified. All claims run in parallel.',
    tiles: [
      <div className={styles.mini}>
        <span className={styles.search}>
          <Search size={13} aria-hidden="true" /> Riverton transit fare $3.50 January
        </span>
        <span className={styles.snippet} />
        <span className={cx(styles.snippet, styles.short)} />
        <span className={styles.snippet} />
        <span className={cx(styles.snippet, styles.short)} />
      </div>,
      <div className={cx(styles.mini, styles.verdicts)}>
        <VerdictBadge verdict="confirmed" />
        <VerdictBadge verdict="contradicted" />
        <VerdictBadge verdict="unverified" />
        <small>Ambiguous evidence defaults to unverified.</small>
      </div>,
    ],
  },
  {
    id: 'score',
    label: 'Score',
    title: (
      <>
        Turn evidence into
        <br /> a number you can audit
      </>
    ),
    text: 'Counts and labels feed the Beta Reputation System. Credibility, Transparency and Objectivity combine into the Trust Score, and a weak factual base pulls the whole score down.',
    tiles: [
      <div className={cx(styles.mini, styles.formula)}>
        <span>Trust =</span>
        <span>0.5 · Credibility</span>
        <span>+ 0.3 · Transparency</span>
        <span>+ 0.2 · Objectivity</span>
      </div>,
      <div className={cx(styles.mini, styles.ringTile)}>
        <ScoreRing value={SAMPLE_SCORES.trust} size={112} stroke={7} />
      </div>,
    ],
  },
];

export function HowItWorks() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const uid = useId();

  const focusTab = (i: number) => {
    const next = (i + TABS.length) % TABS.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const map: Record<string, () => void> = {
      ArrowRight: () => focusTab(active + 1),
      ArrowLeft: () => focusTab(active - 1),
      Home: () => focusTab(0),
      End: () => focusTab(TABS.length - 1),
    };
    const action = map[e.key];
    if (action) {
      e.preventDefault();
      action();
    }
  };

  const tab = TABS[active];

  return (
    <section id="how-it-works" className="section" aria-labelledby="how-title">
      <div className="container">
        <Reveal className="section-head section-head--start">
          <p className="eyebrow">Hybrid by design</p>
          <h2 id="how-title" className="heading">
            How <em>Veritas</em> helps you read the news better
          </h2>
        </Reveal>

        <Reveal delay={100}>
          <div role="tablist" aria-label="Analysis stages" className={styles.tablist} style={{ '--active': active } as CSSProperties}>
            {TABS.map((t, i) => (
              <button
                key={t.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                type="button"
                id={`${uid}-tab-${t.id}`}
                aria-selected={i === active}
                aria-controls={`${uid}-panel`}
                tabIndex={i === active ? 0 : -1}
                className={styles.tab}
                onClick={() => setActive(i)}
                onKeyDown={onKeyDown}
              >
                <span className={styles.tabIndex}>0{i + 1}</span>
                {t.label}
              </button>
            ))}
            <span className={styles.indicator} aria-hidden="true" />
          </div>

          <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${tab.id}`} tabIndex={0} className={styles.panel} key={tab.id}>
            <div className={styles.panelCopy}>
              <h3>{tab.title}</h3>
              <p>{tab.text}</p>
            </div>
            <div className={styles.tiles} aria-hidden="true">
              <div className={cx(styles.tile, styles.tileOlive)}>{tab.tiles[0]}</div>
              <div className={cx(styles.tile, styles.tileAmber)}>{tab.tiles[1]}</div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
