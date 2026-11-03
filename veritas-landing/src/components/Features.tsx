import { motion } from 'framer-motion';
import { BrainCircuit, ArrowRight, Landmark, Highlighter, Languages, FileSearch, ShieldCheck, Braces } from 'lucide-react';
import { spotlight } from '../lib/hooks';
import { CountUp } from './CountUp';
import { MaskLines, FadeUp } from './Reveal';
import { EASE } from '../lib/motion';

const card = (i: number) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-4% 0px' },
  transition: { duration: 0.7, delay: (i % 3) * 0.07, ease: EASE },
});

export function Features() {
  return (
    <section id="features">
      <div className="container">
        <div className="section-head center">
          <FadeUp><div className="eyebrow">Features</div></FadeUp>
          <MaskLines className="section-title" lines={[<>Why you can <span className="em">verify</span></>, 'Veritas itself']} />
          <FadeUp delay={0.2}><p className="section-lead">We don’t ask you to take our word for it. The score is built from visible numbers, not from a model’s gut feeling.</p></FadeUp>
        </div>

        <div className="bento">
          <motion.article className="glass bento-card b-a" onMouseMove={spotlight} {...card(0)}>
            <div className="b-icon"><BrainCircuit size={26} /></div>
            <h3>Hybrid by design: LLMs find evidence, formulas decide</h3>
            <p>Language models return only counts and labels: claims, citations, manipulative phrases. The score itself comes from a deterministic Beta Reputation System, which is unit-testable and reproducible.</p>
            <div className="hybrid-vis">
              <div className="hv-box">Article<small>id-indexed paragraphs</small></div><ArrowRight className="hv-arrow" size={20} />
              <div className="hv-box">LLM agents<small>evidence, not scores</small></div><ArrowRight className="hv-arrow" size={20} />
              <div className="hv-box solid">BRS formulas<small>Trust Score</small></div>
            </div>
          </motion.article>

          <motion.article className="glass bento-card b-b" onMouseMove={spotlight} {...card(1)}>
            <div className="b-icon"><FileSearch size={26} /></div>
            <h3>Cross-verification</h3>
            <p>Up to 5 claims per article, each with its own search and an evidence link.</p>
            <div className="verdicts">
              <div className="claim"><span className="st ok">CONFIRMED</span>evidence found</div>
              <div className="claim"><span className="st bad">CONTRADICTED</span>refuting evidence</div>
              <div className="claim"><span className="st unk">UNVERIFIED</span>not enough data</div>
            </div>
          </motion.article>

          <motion.article className="glass bento-card b-c" onMouseMove={spotlight} {...card(2)}>
            <div className="b-icon"><Landmark size={26} /></div>
            <div className="big-num accent-mid" style={{ marginTop: 14 }}><CountUp to={54} /></div>
            <h3 style={{ marginTop: 6 }}>Domain reputation</h3>
            <p>A local table of known outlets. Unknown sites are rated through search plus an LLM lookup.</p>
          </motion.article>

          <motion.article className="glass bento-card b-d" onMouseMove={spotlight} {...card(3)}>
            <div className="b-icon"><Highlighter size={26} /></div>
            <h3>In-page highlights</h3>
            <p>Warnings and risks are marked directly in the article text, with the reason on hover.</p>
          </motion.article>

          <motion.article className="glass bento-card b-e" onMouseMove={spotlight} {...card(4)}>
            <div className="b-icon"><Languages size={26} /></div>
            <h3>UK / EN and your own text</h3>
            <p>Interface and summary in two languages, plus a “write and analyze” mode for pasted text.</p>
            <div className="lang-switch"><span className="cur">UK</span><span>EN</span></div>
          </motion.article>

          <motion.article className="glass bento-card b-f" onMouseMove={spotlight} {...card(5)}>
            <div className="b-icon"><ShieldCheck size={26} /></div>
            <h3>Built to keep working</h3>
            <p>Retries with backoff, primary and fallback model switching, search timeouts. If an agent fails, you get a neutral 50 / 50 / 50 result instead of an error.</p>
          </motion.article>

          <motion.article className="glass bento-card b-g" onMouseMove={spotlight} {...card(6)}>
            <div className="b-icon"><Braces size={26} /></div>
            <h3>Typed LLM output</h3>
            <p>Gemini responses are parsed through instructor into Pydantic v2 models, so malformed output fails validation instead of leaking into scoring.</p>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
