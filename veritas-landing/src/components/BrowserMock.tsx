import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, FileText, Lock, Plus, Puzzle, RotateCcw, RotateCw, Settings, X } from 'lucide-react';
import { SAMPLE_SCORES, TONE_LABEL, scoreTone } from '../lib/scoring';
import { cx } from '../lib/hooks';
import styles from './BrowserMock.module.css';

/**
 * Hero scene: a desktop browser with a news article on the left and the
 * Veritas popup on the right, playing one analysis from start to finish.
 *
 *  1. the popup opens in its "analyzing" state (spinner, status messages and
 *     progress dots, as in extension/popup.html);
 *  2. a scan line sweeps the article from top to bottom; flagged paragraphs
 *     turn yellow as it passes, exactly as content.js highlights them
 *     (whole paragraph, #fff176);
 *  3. the popup switches to the result and the content.js tooltip appears.
 *
 * The article's evidence (4 claims: 3 confirmed + 1 unverified, 1 manipulative
 * phrase, 4 attributed sources) matches SAMPLE_INPUTS, so the numbers are what
 * the scoring model really returns for it.
 *
 * Every size is a multiple of --u (see the CSS), so the scene scales fluidly
 * without JavaScript. The scene itself is decorative and hidden from
 * assistive tech; only the Replay button is exposed.
 */

type Phase = 'idle' | 'scan' | 'done';

/** Status messages of the real popup (extension/popup.js, "en"). */
const STATUS = [
  'Parsing document structure...',
  'Extracting named entities...',
  'Cross-verifying extracted claims...',
  'Analyzing logical consistency...',
  'Synthesizing Veritas Trust Score...',
];

const START_DELAY = 1100; // let the window rise and the popup drop first
const SCAN_MS = 3600;

const s = SAMPLE_SCORES;
const tone = scoreTone(s.trust);

function Ring({ value, active }: { value: number; active: boolean }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  return (
    <div className={cx(styles.ring, `tone-${scoreTone(value)}`)}>
      <svg viewBox="0 0 120 120">
        <circle className={styles.ringTrack} cx="60" cy="60" r={r} />
        <circle
          className={styles.ringFill}
          cx="60"
          cy="60"
          r={r}
          strokeDasharray={c}
          strokeDashoffset={active ? c * (1 - value / 100) : c}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <span className={styles.ringValue}>
        <b>{Math.round(value)}</b>
        <small>Trust Score</small>
      </span>
    </div>
  );
}

function Meter({ label, value, active }: { label: string; value: number; active: boolean }) {
  return (
    <div className={cx(styles.meter, `tone-${scoreTone(value)}`)}>
      <span>{label}</span>
      <b>{Math.round(value)}</b>
      <i>
        <i style={{ transform: `scaleX(${active ? value / 100 : 0})` }} />
      </i>
    </div>
  );
}

export function BrowserMock({ start }: { start: boolean }) {
  const [run, setRun] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [step, setStep] = useState(0);
  const [lit, setLit] = useState<ReadonlySet<string>>(new Set());

  const viewportRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!start) return;
    const viewport = viewportRef.current;
    const beam = beamRef.current;
    if (!viewport || !beam) return;

    const flagged = () => Array.from(viewport.querySelectorAll<HTMLElement>('[data-flag]'));
    let raf = 0;
    let t0 = 0;

    // Reduced motion: show the finished analysis straight away.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      raf = requestAnimationFrame(() => {
        setLit(new Set(flagged().map((el) => el.dataset.flag!)));
        setPhase('done');
      });
      return () => cancelAnimationFrame(raf);
    }

    const tick = (now: number) => {
      if (!t0) {
        // First frame: reset everything (also used by Replay).
        t0 = now + START_DELAY;
        setPhase('idle');
        setStep(0);
        setLit(new Set());
        beam.style.opacity = '0';
      }
      if (now < t0 - 500) {
        raf = requestAnimationFrame(tick);
        return;
      }
      // The popup opens half a second before the scan line starts.
      setPhase((p) => (p === 'idle' ? 'scan' : p));
      if (now < t0) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const v = Math.min(1, (now - t0) / SCAN_MS);
      const vp = viewport.getBoundingClientRect();
      // Top to bottom, in reading order. y is the line; the glow trails above it.
      const y = (vp.height + 20) * v;
      beam.style.transform = `translateY(${y - beam.offsetHeight}px)`;
      beam.style.opacity = v < 1 ? '1' : '0';

      const passed = flagged()
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.top + r.height / 2 - vp.top < y;
        })
        .map((el) => el.dataset.flag!);
      setLit((prev) => (prev.size === passed.length ? prev : new Set(passed)));
      setStep(Math.min(STATUS.length - 1, Math.floor(v * STATUS.length)));

      if (v < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setPhase('done');
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, run]);

  const done = phase === 'done';
  const dots = Math.min(2, Math.floor((step / (STATUS.length - 1)) * 3));

  return (
    <div className={styles.scene}>
      <button type="button" className={styles.replay} onClick={() => setRun((r) => r + 1)} disabled={phase === 'scan'}>
        <RotateCcw aria-hidden="true" />
        Replay demo
      </button>

      <div className={styles.browser} data-phase={phase} aria-hidden="true">
        {/* ---- Window chrome ---- */}
        <div className={styles.tabs}>
          <span className={styles.lights}>
            <i />
            <i />
            <i />
          </span>
          <span className={cx(styles.tab, styles.tabActive)}>
            <span className={styles.favicon}>D</span>
            <span className={styles.tabTitle}>Riverton raises bus fares to $3.50 · The Daily Courier</span>
            <X />
          </span>
          <span className={cx(styles.tab, styles.tabIdle)}>
            <span className={cx(styles.favicon, styles.faviconIdle)}>W</span>
            <span className={styles.tabTitle}>Weather this week</span>
          </span>
          <Plus className={styles.newTab} />
        </div>

        <div className={styles.toolbar}>
          <span className={styles.navBtns}>
            <ArrowLeft />
            <ArrowRight />
            <RotateCw />
          </span>
          <span className={styles.omnibox}>
            <Lock />
            <span>
              dailycourier.example<em>/local/transit-fares-2027</em>
            </span>
          </span>
          <span className={styles.extensions}>
            <Puzzle />
            <span className={styles.vBtn}>V</span>
            <span className={styles.avatar} />
          </span>
        </div>

        {/* ---- Page ---- */}
        <div ref={viewportRef} className={styles.viewport}>
          <div ref={beamRef} className={styles.beam} />

          <div className={styles.site}>
            <div className={styles.masthead}>
              <span className={styles.siteLogo}>The Daily Courier</span>
              <span className={styles.siteNav}>
                <span>U.S.</span>
                <span className={styles.siteNavActive}>Local</span>
                <span>Business</span>
                <span>Opinion</span>
                <span>Sports</span>
              </span>
              <span className={styles.subscribe}>Subscribe</span>
            </div>

            <div className={styles.columns}>
              <article className={styles.article}>
                <p className={styles.kicker}>Local · Transportation</p>
                <p className={styles.headline}>Riverton raises bus fares to $3.50</p>
                <p className={styles.standfirst}>Officials say the extra revenue will fund 120 new electric buses by 2028.</p>
                <p className={styles.byline}>
                  <span className={styles.bylineAvatar} />
                  <span>
                    <b>Daily Courier staff</b> · March 15 · 4 min read
                  </span>
                </p>

                <p className={styles.para}>
                  According to the city council, a single ride will rise from $2.75 to $3.50 in January. The transportation department said
                  the increase was approved at a public meeting on March 14.
                </p>
                <p className={styles.para}>
                  <span data-flag="routes" className={cx(styles.hl, lit.has('routes') && styles.lit)}>
                    Two more bus routes will be cut in the spring, a source inside the department claimed. The department declined to
                    comment.
                  </span>
                </p>
                <p className={cx(styles.para, styles.anchor)}>
                  <span data-flag="blow" className={cx(styles.hl, lit.has('blow') && styles.lit)}>
                    For many residents the decision is a devastating blow that will hurt every family in the city.
                  </span>
                  <span className={styles.tooltip}>
                    <span className={styles.tipArrow} />
                    <span className={styles.tipHead}>
                      <span className={styles.tipTitle}>Manipulative phrase</span>
                    </span>
                    <span className={styles.tipBody}>Emotional framing (“devastating blow”) instead of facts. The fare figures are confirmed.</span>
                    <span className={styles.tipFoot}>
                      <span className={styles.tipBtn}>Dismiss</span>
                    </span>
                  </span>
                </p>
                <p className={styles.para}>
                  An economist at Riverton State University said fares were last raised in 2019 and remain below the national average.
                </p>
              </article>

              <aside className={styles.sidebar}>
                <p className={styles.sideTitle}>Most read</p>
                {['Bridge repairs to finish by June', 'New bike lanes open downtown', 'Mayor unveils housing plan'].map((t, i) => (
                  <p key={t} className={styles.sideItem}>
                    <b>{i + 1}</b>
                    {t}
                  </p>
                ))}
              </aside>
            </div>
          </div>

          {/* ---- Veritas popup (extension/popup.html) ---- */}
          <div className={styles.popup}>
            <span className={styles.caret} />
            <div className={styles.pHead}>
              <div>
                <p className={styles.pBrand}>Veritas</p>
                <p className={styles.pTagline}>News Credibility Analyzer</p>
              </div>
              <span className={styles.pIcons}>
                <span>
                  <FileText />
                </span>
                <span>
                  <Settings />
                </span>
              </span>
            </div>

            <div className={styles.pBody}>
              {/* Analyzing state */}
              <div className={styles.analyzing}>
                <span className={styles.spinner} />
                <p className={styles.status} key={step}>
                  {STATUS[step]}
                </p>
                <span className={styles.progress}>
                  {[0, 1, 2].map((d) => (
                    <i key={d} className={cx(d <= dots && styles.dotOn)} />
                  ))}
                </span>
                <span className={styles.cancel}>Cancel</span>
              </div>

              {/* Result state */}
              <div className={styles.results}>
                <div className={styles.pScore}>
                  <Ring value={s.trust} active={done} />
                  <span className={cx(styles.pill, `tone-${tone}`)}>{TONE_LABEL[tone]}</span>
                </div>

                <div className={styles.meters}>
                  <Meter label="Credibility" value={s.credibility} active={done} />
                  <Meter label="Transparency" value={s.transparency} active={done} />
                  <Meter label="Objectivity" value={s.objectivity} active={done} />
                </div>

                <div className={styles.issues}>
                  <p>Found issues</p>
                  <div>
                    <span className={styles.warn}>
                      <b>2</b> Warnings
                    </span>
                    <span className={styles.risk}>
                      <b>0</b> High risk
                    </span>
                  </div>
                </div>

                <p className={styles.summary}>
                  Three of four key claims are confirmed by independent sources. One emotional phrase and one unverified claim lower the
                  score slightly.
                </p>
                <span className={styles.again}>Analyze again</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
