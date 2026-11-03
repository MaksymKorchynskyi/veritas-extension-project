import { motion, useInView, useScroll } from 'framer-motion';
import { useRef } from 'react';
import { FileText, Search, Globe2, Gauge, Sparkles, type LucideIcon } from 'lucide-react';
import { MaskLines, FadeUp } from './Reveal';
import { EASE } from '../lib/motion';

interface Step { icon: LucideIcon; tag: string; title: string; desc: string; pills: string[] }

const STEPS: Step[] = [
  { icon: FileText, tag: 'content.js → POST /analyze', title: 'Parse the page', desc: 'Readability.js turns the article into id-indexed paragraphs. The backend validates the headline and text length, then checks a 12-hour cache before doing any work.', pills: ['Readability.js', 'Manifest V3', '12 h cache'] },
  { icon: Search, tag: 'asyncio.gather', title: 'Gather evidence in parallel', desc: 'The extractor pulls up to 5 verifiable claims: figures, dates, concrete events. Predictions and opinions are filtered out. Domain reputation is resolved at the same time.', pills: ['up to 5 claims', '54 outlets', 'LLM only extracts'] },
  { icon: Globe2, tag: 'query → DuckDuckGo → verdict', title: 'Cross-verify every claim', desc: 'For each claim an agent writes a search query, DuckDuckGo returns 3 snippets, and a verdict agent decides. Ambiguous cases default to UNVERIFIED, never to a guess.', pills: ['CONFIRMED', 'CONTRADICTED', 'UNVERIFIED'] },
  { icon: Gauge, tag: 'metrics agent', title: 'Measure the writing', desc: 'Citations and manipulative phrases are counted, with the exact snippets. Direct quotes, wartime terminology and neutral attribution are deliberately not penalized.', pills: ['citations', 'manipulation', 'paragraph highlights'] },
  { icon: Sparkles, tag: 'scoring.py', title: 'Score and explain', desc: 'Deterministic Beta Reputation formulas compute Credibility, Transparency and Objectivity. A summary agent then writes 3 to 5 sentences in your language from the final numbers.', pills: ['Jøsang & Ismail', 'reproducible', 'UK / EN'] },
];

function StepRow({ s, i }: { s: Step; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const active = useInView(ref, { margin: '-42% 0px -42% 0px' });
  const seen = useInView(ref, { once: true, margin: '-4% 0px' });
  const Icon = s.icon;
  return (
    <div className="pipe-step" ref={ref}>
      <motion.div className={`pipe-node ${active ? 'active' : ''}`} initial={{ scale: 0.4, opacity: 0 }} animate={seen ? { scale: active ? 1.08 : 1, opacity: 1 } : {}} transition={{ type: 'spring', stiffness: 320, damping: 20 }}>
        <Icon size={26} />
      </motion.div>
      <motion.div className="glass pipe-card" initial={{ opacity: 0, x: 40 }} animate={seen ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7, ease: EASE }}>
        <span className="tag">0{i + 1} · {s.tag}</span>
        <h3>{s.title}</h3>
        <p>{s.desc}</p>
        <div className="pipe-meta">
          {s.pills.map((p, k) => (
            <motion.span className="pill" key={p} initial={{ opacity: 0, y: 10 }} animate={seen ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.25 + k * 0.06, duration: 0.45, ease: EASE }}>{p}</motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export function Pipeline() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: scaleY } = useScroll({ target: ref, offset: ['start 65%', 'end 55%'] });
  return (
    <section id="pipeline">
      <div className="container">
        <div className="section-head center">
          <FadeUp><div className="eyebrow">Under the hood</div></FadeUp>
          <MaskLines className="section-title" lines={[<>Five steps from click</>, <>to <span className="em accent-high">verdict</span></>]} />
          <FadeUp delay={0.2}><p className="section-lead">Results arrive in 5 to 15 seconds. No magic: every step is traceable in the code.</p></FadeUp>
        </div>
        <div className="pipeline-wrap" ref={ref}>
          <div className="pipe-line"><motion.div style={{ scaleY }} /></div>
          {STEPS.map((s, i) => <StepRow key={s.title} s={s} i={i} />)}
        </div>
      </div>
    </section>
  );
}
