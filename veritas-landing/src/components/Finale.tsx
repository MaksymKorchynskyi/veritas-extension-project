import { motion } from 'framer-motion';
import { useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import { REPO } from '../lib/links';
import { GithubIcon } from './GithubIcon';
import { MaskLines, FadeUp } from './Reveal';
import { EASE } from '../lib/motion';

const CMD = `git clone ${REPO}.git
cd veritas-extension-project/backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
echo "GEMINI_API_KEY=your_key" > .env
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000`;

export function QuickStart() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(CMD); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* clipboard unavailable */ }
  };
  const steps = [
    ['Start the backend', 'Run the commands on the right, then open http://127.0.0.1:8000/health'],
    ['Load the extension', 'chrome://extensions → Developer mode → Load unpacked → pick the extension/ folder'],
    ['Open an article and analyze', 'Your Trust Score appears in 5 to 15 seconds'],
  ];
  return (
    <section id="quickstart">
      <div className="container qs-grid">
        <div>
          <FadeUp><div className="eyebrow">Quick start</div></FadeUp>
          <MaskLines className="section-title" lines={[<>Three minutes</>, <>to your <span className="em accent-high">first</span> check</>]} />
          <FadeUp delay={0.2}><p className="section-lead">You need Python 3.11+, a Chromium-based browser and a Gemini API key.</p></FadeUp>
          <div className="qs-steps">
            {steps.map(([t, d], i) => (
              <motion.div className="qs-step" key={t} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-10% 0px' }} transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}>
                <div className="num">{i + 1}</div><div><b>{t}</b><span>{d}</span></div>
              </motion.div>
            ))}
          </div>
        </div>
        <motion.div className="terminal" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-6% 0px' }} transition={{ duration: 0.8, ease: EASE }}>
          <div className="term-bar">
            <div className="dots"><i /><i /><i /></div>
            <button className="copy" onClick={copy}>{copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}</button>
          </div>
          <pre className="term-body">
            {CMD.split('\n').map((l, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.06, duration: 0.4 }}>
                <span className="p">$ </span>{l}
              </motion.div>
            ))}
            <div><span className="p">$ </span><span className="caret" /></div>
          </pre>
        </motion.div>
      </div>
    </section>
  );
}

export function Final() {
  return (
    <>
      <section className="final">
        <div className="container">
          <MaskLines className="" lines={[<>Read with</>, <><span className="em accent-mid">open eyes</span></>]} delay={0} />
          <FadeUp delay={0.3}><p className="section-lead" style={{ margin: '28px auto 0' }}>Veritas won’t tell you what to think. It shows you what an article stands on.</p></FadeUp>
          <FadeUp delay={0.45}>
            <div className="hero-cta">
              <a href="#quickstart" className="btn btn-primary"><Download size={18} /> Get started</a>
              <a href={REPO} target="_blank" rel="noreferrer" className="btn btn-ghost"><GithubIcon /> GitHub</a>
            </div>
          </FadeUp>
        </div>
      </section>
      <footer>
        <div className="container foot">
          <div className="brand">Veritas</div>
          <nav aria-label="Links">
            <a href={REPO} target="_blank" rel="noreferrer">GitHub</a>
            <a href={`${REPO}#readme`} target="_blank" rel="noreferrer">Documentation</a>
            <a href={`${REPO}/blob/HEAD/LICENSE`} target="_blank" rel="noreferrer">MIT License</a>
          </nav>
          <small>© {new Date().getFullYear()} Veritas · Scoring model: Jøsang, A. &amp; Ismail, R. (2002), “The Beta Reputation System”</small>
        </div>
      </footer>
    </>
  );
}
