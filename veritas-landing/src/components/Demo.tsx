import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { computeScores } from '../lib/scoring';
import { Bar, ScoreRing } from './ScoreRing';
import { MaskLines, FadeUp } from './Reveal';
import { EASE } from '../lib/motion';

type Kind = 'ok' | 'warn' | 'risk';
interface Hl { kind: Kind; label: string; text: string }

const HL: Record<string, Hl> = {
  tariff: { kind: 'ok', label: 'Confirmed', text: 'The figure was found in two independent sources.' },
  manip: { kind: 'warn', label: 'Manipulative phrase', text: 'Emotional framing instead of facts: “secretly”, “shocking”.' },
  expert: { kind: 'warn', label: 'Anonymous source', text: '“Experts” are not named, so the claim cannot be checked.' },
  loss: { kind: 'risk', label: 'Contradicted', text: 'Open data gives a very different value. The gap is significant.' },
  date: { kind: 'warn', label: 'Unverified', text: 'No supporting evidence found in search. This lowers credibility.' },
};

const DEMO_INPUTS = { confirmed: 1, contradicted: 1, unverified: 1, citations: 1, manipulative: 2, words: 400, domainTrust: 0.5 };
const DURATION = 3000;

function H({ id, lit, children }: { id: string; lit: Set<string>; children: React.ReactNode }) {
  const h = HL[id];
  return (
    <span className={`hl ${h.kind} ${lit.has(id) ? 'on' : ''}`} data-id={id} tabIndex={0}>
      {children}
      <span className="tip" role="tooltip"><b>{h.label}</b>{h.text}</span>
    </span>
  );
}

export function Demo() {
  const ref = useRef<HTMLDivElement>(null);
  const pane = useRef<HTMLDivElement>(null);
  const beam = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const [run, setRun] = useState(0);
  const [lit, setLit] = useState<Set<string>>(new Set());
  const [done, setDone] = useState(false);
  const scores = useMemo(() => computeScores(DEMO_INPUTS), []);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const t0 = performance.now() + 350;
    const tick = (t: number) => {
      const v = Math.max(0, Math.min(1, (t - t0) / DURATION));
      const root = pane.current;
      if (root) {
        const last = root.querySelector<HTMLElement>('[data-id="date"]')!;
        const travel = last.offsetTop + last.offsetHeight + 40;
        const bottom = v * travel;
        if (beam.current) { beam.current.style.opacity = v > 0 && v < 1 ? '1' : '0'; beam.current.style.transform = `translateY(${bottom - 90}px)`; }
        const next = new Set<string>();
        root.querySelectorAll<HTMLElement>('.hl').forEach((el) => { if (el.offsetTop + el.offsetHeight / 2 < bottom) next.add(el.dataset.id!); });
        setLit((prev) => (prev.size === next.size ? prev : next));
      }
      setDone((d) => (d === (v >= 1) ? d : v >= 1));
      if (v < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, run]);

  const claimOn = (id: string) => lit.has(id);

  return (
    <section className="demo" id="demo">
      <div className="container">
        <div className="section-head center">
          <FadeUp><div className="eyebrow">Live demo</div></FadeUp>
          <MaskLines className="section-title" lines={[<>Watch Veritas <span className="em accent-mid">read</span></>, 'an article']} />
          <FadeUp delay={0.2}><p className="section-lead">A beam sweeps the text and highlights claims, manipulation and citations. Hover any highlight to see the reason.</p></FadeUp>
        </div>

        <motion.div ref={ref} className="browser" initial={{ opacity: 0, y: 50, scale: 0.97 }} animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}} transition={{ duration: 0.8, ease: EASE }}>
          <div className="browser-bar">
            <div className="dots"><i /><i /><i /></div>
            <div className="url">city-news.example/transport/fares-double</div>
            <div className="ext-btn">V</div>
          </div>
          <div className="browser-body">
            <div className="article-pane" ref={pane}>
              <div className="scan-beam" ref={beam} style={{ top: 0, opacity: 0 }} aria-hidden />
              <h3>Transit fares set to double: authorities hid it from residents</h3>
              <p>
                The city council <H id="manip" lit={lit}>secretly passed a shocking decision</H> on transit fares. <H id="tariff" lit={lit}>A ticket will rise from 8 to 15 UAH</H> starting next January.
              </p>
              <p>
                <H id="expert" lit={lit}>Experts unanimously say this is a disaster</H>, and <H id="loss" lit={lit}>the city’s transit system lost 40% of its riders last year</H>.
              </p>
              <p>
                We asked the relevant department. Its reply states that <H id="date" lit={lit}>the decision was discussed at an open session on March 14</H>.
              </p>
            </div>

            <div className="result-pane">
              <div className="rp-head"><div className="logo">Veritas</div><div className="sub">Intelligence</div></div>
              <ScoreRing value={scores.trust} active={done} />
              <div className="bars">
                <Bar label="Credibility" value={scores.credibility} active={done} />
                <Bar label="Transparency" value={scores.transparency} active={done} />
                <Bar label="Objectivity" value={scores.objectivity} active={done} />
              </div>
              <div className="claim-list">
                <motion.div className="claim" animate={{ opacity: claimOn('tariff') ? 1 : 0.25, x: claimOn('tariff') ? 0 : 14 }} transition={{ duration: 0.4, ease: EASE }}><span className="st ok">CONFIRMED</span>Fare 8 → 15 UAH</motion.div>
                <motion.div className="claim" animate={{ opacity: claimOn('loss') ? 1 : 0.25, x: claimOn('loss') ? 0 : 14 }} transition={{ duration: 0.4, ease: EASE }}><span className="st bad">CONTRADICTED</span>40% ridership loss</motion.div>
                <motion.div className="claim" animate={{ opacity: claimOn('date') ? 1 : 0.25, x: claimOn('date') ? 0 : 14 }} transition={{ duration: 0.4, ease: EASE }}><span className="st unk">UNVERIFIED</span>Session on March 14</motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        <p className="demo-note">
          Illustrative article. Scores are computed with the same BRS formulas as the backend.
          <button className="replay" onClick={() => setRun((r) => r + 1)}><RotateCcw size={13} /> Replay</button>
        </p>
      </div>
    </section>
  );
}
